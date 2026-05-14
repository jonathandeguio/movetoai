/**
 * GET /api/cron/certifications
 *
 * Certification expiry alert cron job.
 * Scans all WorkspaceCertification records with an upcoming expiry and sends
 * in-app notifications at J-90, J-30, and J=0 (expired).
 *
 * Called by Vercel Cron (vercel.json) or any external scheduler.
 * Protected by CRON_SECRET env var.
 */

export const runtime = "nodejs";

import { NextResponse }  from "next/server";

import { prisma }        from "@/lib/prisma";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now   = new Date();
  const in90d = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // ── Fetch candidates ────────────────────────────────────────────────────────
  // All non-expired certs with expiry within 90 days that still need an alert,
  // plus already-expired certs that haven't been marked yet.
  const certs = await prisma.workspaceCertification.findMany({
    where: {
      expiryDate: { not: null, lte: in90d },
      status:     { not: "not_applicable" },
      OR: [
        { alert90Sent: false },
        { alert30Sent: false },
        { alert0Sent:  false },
      ],
    },
    include: {
      catalog:   { select: { shortName: true, name: true } },
      workspace: { select: { id: true, name: true } },
    },
  });

  let notifsSent      = 0;
  let expiredUpdated  = 0;
  let skipped         = 0;

  for (const cert of certs) {
    const expiryDate = cert.expiryDate!;
    const daysLeft   = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine which alert tier applies
    type AlertTier = "0" | "30" | "90";
    let tier: AlertTier | null = null;

    if (daysLeft <= 0  && !cert.alert0Sent)  tier = "0";
    else if (daysLeft <= 30 && !cert.alert30Sent) tier = "30";
    else if (daysLeft <= 90 && !cert.alert90Sent) tier = "90";

    if (!tier) { skipped++; continue; }

    // ── Collect recipient user IDs ──────────────────────────────────────────
    const recipientIds = new Set<string>();

    // 1. Direct owner of the certification
    if (cert.ownerId) recipientIds.add(cert.ownerId);

    // 2. Workspace admins (fallback or always include)
    const adminMemberships = await prisma.membership.findMany({
      where: {
        workspaceId: cert.workspaceId,
        status:      "ACTIVE",
        role:        { code: "WORKSPACE_ADMIN" },
      },
      select: { userId: true },
    });
    for (const m of adminMemberships) recipientIds.add(m.userId);

    if (recipientIds.size === 0) { skipped++; continue; }

    // ── Build notification copy ──────────────────────────────────────────────
    const shortName = cert.catalog.shortName;
    const fullName  = cert.catalog.name;

    const title =
      tier === "0"
        ? `⚠️ Certification expirée : ${shortName}`
        : `🔔 Renouvellement à planifier : ${shortName} (J${daysLeft > 0 ? `-${daysLeft}` : "0"})`;

    const body =
      tier === "0"
        ? `La certification ${fullName} a expiré. Engagez la procédure de renouvellement dès que possible.`
        : `La certification ${fullName} expire dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}. ` +
          `Planifiez le processus de renouvellement pour maintenir votre conformité.`;

    const link = `/app/compliance/${cert.id}`;

    // ── Create notifications ─────────────────────────────────────────────────
    for (const userId of recipientIds) {
      await prisma.notification.create({
        data: {
          workspaceId: cert.workspaceId,
          userId,
          type:  "certification_expiry",
          title,
          body,
          link,
        },
      });
      notifsSent++;
    }

    // ── Update alert flags + status ──────────────────────────────────────────
    const flagUpdate: {
      alert90Sent?: boolean;
      alert30Sent?: boolean;
      alert0Sent?:  boolean;
      status?:      string;
    } = {};

    if (tier === "90") {
      flagUpdate.alert90Sent = true;
    } else if (tier === "30") {
      flagUpdate.alert90Sent = true;
      flagUpdate.alert30Sent = true;
    } else {
      // tier === "0" — expired
      flagUpdate.alert90Sent = true;
      flagUpdate.alert30Sent = true;
      flagUpdate.alert0Sent  = true;
      // Only flip to "expired" if currently obtained or in_progress
      if (cert.status === "obtained" || cert.status === "in_progress") {
        flagUpdate.status = "expired";
        expiredUpdated++;
      }
    }

    await prisma.workspaceCertification.update({
      where: { id: cert.id },
      data:  flagUpdate,
    });
  }

  return NextResponse.json({
    ok:             true,
    processed:      certs.length,
    notifsSent,
    expiredUpdated,
    skipped,
    ranAt:          now.toISOString(),
  });
}
