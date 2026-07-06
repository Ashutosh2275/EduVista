import env from '../config/env';

export function buildPasswordResetEmail(name: string, resetUrl: string): string {
  const expireMinutes = env.PASSWORD_RESET_EXPIRE_MINUTES;
  const logoUrl = `${env.FRONTEND_URL}/eduvista-logo.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your EduVista Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6fb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px;text-align:center;">
              <img src="${logoUrl}" alt="EduVista" width="160" style="display:block;margin:0 auto 12px;max-width:160px;height:auto;" />
              <p style="margin:0;color:rgba(255,255,255,0.9);font-size:14px;letter-spacing:0.3px;">AI-Powered Educational Discovery</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#0f172a;">Reset your password</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${name},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                We received a request to reset the password for your EduVista account. Click the button below to choose a new password.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="border-radius:10px;background:#4f46e5;">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#64748b;">
                If the button does not work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:13px;line-height:1.6;word-break:break-all;">
                <a href="${resetUrl}" style="color:#4f46e5;text-decoration:underline;">${resetUrl}</a>
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;margin-bottom:20px;">
                <tr>
                  <td style="padding:14px 16px;font-size:13px;line-height:1.5;color:#9a3412;">
                    <strong>Expires in ${expireMinutes} minutes.</strong> This link is valid for one-time use only.
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
                <tr>
                  <td style="padding:14px 16px;font-size:13px;line-height:1.5;color:#475569;">
                    <strong>Security notice:</strong> If you did not request a password reset, ignore this email. Your password will remain unchanged. Never share this link with anyone.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
                &copy; ${new Date().getFullYear()} EduVista. All rights reserved.<br />
                This is an automated message — please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
