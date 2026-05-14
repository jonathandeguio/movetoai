import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "noreply@moveto.ai";
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

/** Generate a 6-digit OTP, hash it, store it in DB, and send via email. */
export async function generateAndSendOTP(email: string): Promise<{ ok: boolean; error?: string }> {
  const code = String(Math.floor(100000 + crypto.randomInt(900000)));
  const hashed = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate previous codes for this email
  await prisma.emailVerification.updateMany({
    where: { email, verified: false },
    data: { verified: true }, // mark as used / expired
  });

  await prisma.emailVerification.create({
    data: { email, code: hashed, expires_at: expiresAt },
  });

  if (!resend) {
    // Dev mode — log the code
    console.log(`[OTP dev] code for ${email}: ${code}`);
    return { ok: true };
  }

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Votre code de vérification move.ai",
    html: buildOTPEmailHtml(code),
  });

  if (error) return { ok: false, error: "Impossible d'envoyer l'email." };
  return { ok: true };
}

/** Verify a submitted OTP code. Returns ok:true and marks as verified on success. */
export async function verifyOTP(
  email: string,
  submittedCode: string
): Promise<{ ok: boolean; error?: string }> {
  const record = await prisma.emailVerification.findFirst({
    where: { email, verified: false },
    orderBy: { created_at: "desc" },
  });

  if (!record) return { ok: false, error: "Aucun code en attente." };
  if (record.expires_at < new Date()) return { ok: false, error: "Code expiré." };
  if (record.attempts >= MAX_ATTEMPTS) return { ok: false, error: "Trop de tentatives." };

  const match = await bcrypt.compare(submittedCode, record.code);

  if (!match) {
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = MAX_ATTEMPTS - record.attempts - 1;
    return { ok: false, error: remaining > 0 ? `Code incorrect. ${remaining} tentative(s) restante(s).` : "Trop de tentatives." };
  }

  await prisma.emailVerification.update({
    where: { id: record.id },
    data: { verified: true },
  });

  return { ok: true };
}

export function buildOTPEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Code de vérification</title></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="420" cellpadding="0" cellspacing="0" style="background:#1a1d27;border-radius:16px;border:1px solid #2a2d3a;overflow:hidden;">
        <tr><td style="padding:32px 32px 24px;">
          <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.02em;">
            move<span style="color:#22c55e;">.</span>ai
          </p>
          <p style="margin:0;font-size:13px;color:#6b7280;">Vérification de votre adresse email</p>
        </td></tr>
        <tr><td style="padding:0 32px 32px;">
          <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;">
            Votre code de vérification est :
          </p>
          <div style="background:#0f1117;border-radius:12px;padding:20px;text-align:center;letter-spacing:0.25em;font-size:36px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums;">
            ${code}
          </div>
          <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">
            Ce code expire dans ${OTP_EXPIRY_MINUTES} minutes.<br/>
            Si vous n'avez pas demandé ce code, ignorez cet email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
