export function opportunityAssignedHtml({
  assignerName,
  opportunityTitle,
  priority,
  domain,
  opportunityUrl,
}: {
  assignerName: string;
  opportunityTitle: string;
  priority?: string | null;
  domain?: string | null;
  opportunityUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><title>Opportunité assignée</title></head>
<body style="margin:0;padding:0;background:#060810;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#0f1117;border-radius:16px;border:1px solid #1e2030;">
        <tr><td style="padding:32px 32px 16px;">
          <p style="margin:0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.02em;">
            move<span style="color:#6ee7b7;">.</span>ai
          </p>
        </td></tr>
        <tr><td style="padding:0 32px 32px;">
          <p style="font-size:20px;font-weight:700;color:#fff;margin:0 0 8px;">${escapeHtml(assignerName)} vous a assigné une opportunité IA</p>
          <div style="background:#1a1d27;border-radius:12px;padding:20px;margin:16px 0;">
            <p style="font-size:16px;font-weight:600;color:#fff;margin:0 0 8px;">${escapeHtml(opportunityTitle)}</p>
            ${priority ? `<span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:99px;background:#6ee7b730;color:#6ee7b7;">${escapeHtml(priority)}</span>` : ""}
            ${domain ? `<span style="font-size:12px;color:#6b7280;margin-left:8px;">${escapeHtml(domain)}</span>` : ""}
          </div>
          <a href="${opportunityUrl}" style="display:inline-block;background:#6ee7b7;color:#060810;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">
            Voir l'opportunité →
          </a>
          <p style="font-size:12px;color:#4b5563;margin-top:24px;">Move to AI · Plateforme de pilotage des opportunités IA</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
