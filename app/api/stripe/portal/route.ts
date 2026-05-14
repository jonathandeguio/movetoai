import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  if (!workspace.stripeCustomerId) return NextResponse.json({ error: "No billing account" }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: workspace.stripeCustomerId,
    return_url: `${appUrl}/app/admin/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
