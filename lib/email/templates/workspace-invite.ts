export function workspaceInviteHtml({
  inviterName,
  workspaceName,
  inviteUrl,
}: {
  inviterName: string;
  workspaceName: string;
  inviteUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#060810;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#0f1117;border-radius:16px;border:1px solid #1e2030;">
        <tr><td style="padding:32px 32px 16px;">
          <p style="margin:0;font-size:24px;font-weight:800;color:#fff;">move<span style="color:#6ee7b7;">.</span>ai</p>
        </td></tr>
        <tr><td style="padding:0 32px 32px;">
          <p style="font-size:20px;font-weight:700;color:#fff;margin:0 0 8px;">${escapeHtml(inviterName)} vous invite dans ${escapeHtml(workspaceName)}</p>
          <p style="font-size:14px;color:#9ca3af;margin:0 0 24px;">Rejoignez l'équipe sur Move to AI pour collaborer sur l'identification et le pilotage des opportunités IA.</p>
          <a href="${inviteUrl}" style="display:inline-block;background:#6ee7b7;color:#060810;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">
            Rejoindre l'équipe →
          </a>
          <p style="font-size:12px;color:#4b5563;margin-top:24px;">Move to AI</p>
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
