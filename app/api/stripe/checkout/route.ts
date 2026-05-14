import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  priceId: z.string(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const body = schema.parse(await req.json());
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Get or create Stripe customer
  let customerId = workspace.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      metadata: { workspaceId: workspace.id },
    });
    customerId = customer.id;
    await prisma.workspace.update({ where: { id: workspace.id }, data: { stripeCustomerId: customerId } });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: body.priceId, quantity: 1 }],
    mode: "subscription",
    success_url: body.successUrl ?? `${appUrl}/app/admin/billing?success=1`,
    cancel_url: body.cancelUrl ?? `${appUrl}/app/admin/billing`,
    metadata: { workspaceId: workspace.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
