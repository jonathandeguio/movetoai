export const runtime = "nodejs";

import crypto from "crypto";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const webhook = await prisma.webhook.findFirst({
    where: { id: params.id, workspaceId: workspace.id },
  });
  if (!webhook) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const payload = {
    event: "test",
    timestamp: new Date().toISOString(),
    workspace: { id: workspace.id, name: workspace.name },
  };

  const bodyString = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", webhook.secret);
  hmac.update(bodyString);
  const signature = `sha256=${hmac.digest("hex")}`;

  const start = Date.now();
  let statusCode: number | null = null;
  let responseBody: string | null = null;
  let success = false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": "test",
      },
      body: bodyString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    statusCode = res.status;
    responseBody = await res.text().catch(() => null);
    success = res.ok;
  } catch (err) {
    success = false;
    responseBody = err instanceof Error ? err.message : "Unknown error";
  }

  const duration = Date.now() - start;

  await prisma.webhookDelivery.create({
    data: {
      webhookId: webhook.id,
      eventType: "test",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: payload as any,
      statusCode,
      responseBody,
      success,
      duration,
    },
  });

  return NextResponse.json({ success, statusCode, duration });
}
