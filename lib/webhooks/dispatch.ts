import "server-only";

import crypto from "crypto";

import { prisma } from "@/lib/prisma";

export async function dispatchWebhookEvent(
  workspaceId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  let webhooks: {
    id: string;
    url: string;
    secret: string;
    events: unknown;
  }[];

  try {
    webhooks = await prisma.webhook.findMany({
      where: { workspaceId, active: true },
      select: { id: true, url: true, secret: true, events: true },
    });
  } catch {
    return;
  }

  const matching = webhooks.filter((wh) => {
    const events = Array.isArray(wh.events) ? (wh.events as string[]) : [];
    return events.includes(eventType);
  });

  if (matching.length === 0) return;

  const bodyString = JSON.stringify({
    event: eventType,
    timestamp: new Date().toISOString(),
    data: payload,
  });

  await Promise.allSettled(
    matching.map(async (webhook) => {
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
            "X-Webhook-Event": eventType,
          },
          body: bodyString,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        statusCode = res.status;
        responseBody = await res.text().catch(() => null);
        success = res.ok;
      } catch (err) {
        responseBody = err instanceof Error ? err.message : "Unknown error";
      }

      const duration = Date.now() - start;

      await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          eventType,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payload: { event: eventType, data: payload } as any,
          statusCode,
          responseBody,
          success,
          duration,
        },
      });
    })
  );
}
