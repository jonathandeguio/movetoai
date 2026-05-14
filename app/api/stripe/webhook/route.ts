import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  let event: import("stripe").Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as import("stripe").Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      if (workspaceId && session.subscription) {
        await prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            stripeSubscriptionId: String(session.subscription),
            planType: "PRO",
          },
        });
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as import("stripe").Stripe.Subscription;
      const ws = await prisma.workspace.findFirst({ where: { stripeCustomerId: String(sub.customer) } });
      if (ws) {
        const planType = sub.status === "active" ? "PRO" : "FREE";
        const expiresAt = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;
        await prisma.workspace.update({ where: { id: ws.id }, data: { planType, planExpiresAt: expiresAt } });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as import("stripe").Stripe.Subscription;
      const ws = await prisma.workspace.findFirst({ where: { stripeCustomerId: String(sub.customer) } });
      if (ws) {
        await prisma.workspace.update({ where: { id: ws.id }, data: { planType: "FREE", stripeSubscriptionId: null } });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
