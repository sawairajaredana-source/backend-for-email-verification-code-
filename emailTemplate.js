export function getVerifyEmailTemplate(otp) {
  const formattedOtp = `${otp.slice(0, 3)} ${otp.slice(3)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Verify Your Email – GETXH</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6fb;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6fb;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">

          <tr>
            <td style="background:linear-gradient(90deg,#4f46e5 0%,#7c3aed 100%);height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <tr>
            <td align="center" style="padding:40px 40px 8px 40px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-radius:12px;padding:10px 22px;">
                    <span style="font-size:22px;font-weight:800;letter-spacing:3px;color:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;text-transform:uppercase;">GETXH</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 40px 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #eef0f6;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:32px 40px 0 40px;">
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#111827;letter-spacing:-0.5px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">Verify Your Email</h1>
              <p style="margin:12px 0 0 0;font-size:15px;color:#6b7280;line-height:1.6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">Use the code below to complete your signup for GETXH.</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:36px 40px;">
              <table cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#f0f0ff 0%,#ede9fe 100%);border-radius:14px;border:1.5px solid #c7d2fe;">
                <tr>
                  <td align="center" style="padding:28px 48px;">
                    <p style="margin:0 0 6px 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#6366f1;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">Your verification code</p>
                    <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:10px;color:#1e1b4b;font-family:'Courier New',Courier,monospace;line-height:1.2;">${formattedOtp}</p>
                    <p style="margin:12px 0 0 0;font-size:12px;color:#9ca3af;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">Expires in <strong style="color:#4f46e5;">5 minutes</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:10px 16px;background-color:#f9fafb;border-radius:8px;border-left:3px solid #4f46e5;">
                    <p style="margin:0;font-size:13.5px;color:#374151;line-height:1.6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
                      Enter this code on the verification page to activate your account. Do not share it with anyone.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:10px;font-size:0;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:10px 16px;background-color:#fff7ed;border-radius:8px;border-left:3px solid #f97316;">
                    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
                      If you did not request this code, you can safely ignore this email. No action is required.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 40px 40px 40px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background:linear-gradient(90deg,#4f46e5 0%,#7c3aed 100%);border-radius:50px;box-shadow:0 4px 14px rgba(79,70,229,0.35);">
                    <a href="https://getxh.in" target="_blank" style="display:inline-block;padding:14px 40px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
                      Go to GETXH
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #eef0f6;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 40px 32px 40px;">
              <p style="margin:0 0 4px 0;font-size:12px;color:#9ca3af;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
                &copy; 2026 GETXH. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
                Need help? <a href="mailto:support@getxh.in" style="color:#6366f1;text-decoration:none;">support@getxh.in</a>
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

export function getResetPasswordTemplate(otp) {
  const formattedOtp = `${otp.slice(0, 3)} ${otp.slice(3)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Reset Your Password – GETXH</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6fb;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6fb;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">

          <tr>
            <td style="background:linear-gradient(90deg,#dc2626 0%,#ea580c 100%);height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <tr>
            <td align="center" style="padding:40px 40px 8px 40px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-radius:12px;padding:10px 22px;">
                    <span style="font-size:22px;font-weight:800;letter-spacing:3px;color:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;text-transform:uppercase;">GETXH</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 40px 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #eef0f6;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:32px 40px 0 40px;">
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#111827;letter-spacing:-0.5px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">Reset Your Password</h1>
              <p style="margin:12px 0 0 0;font-size:15px;color:#6b7280;line-height:1.6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">Use the code below to reset your GETXH account password.</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:36px 40px;">
              <table cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%);border-radius:14px;border:1.5px solid #fecdd3;">
                <tr>
                  <td align="center" style="padding:28px 48px;">
                    <p style="margin:0 0 6px 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#dc2626;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">Your reset code</p>
                    <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:10px;color:#7f1d1d;font-family:'Courier New',Courier,monospace;line-height:1.2;">${formattedOtp}</p>
                    <p style="margin:12px 0 0 0;font-size:12px;color:#9ca3af;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">Expires in <strong style="color:#dc2626;">5 minutes</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:10px 16px;background-color:#f9fafb;border-radius:8px;border-left:3px solid #dc2626;">
                    <p style="margin:0;font-size:13.5px;color:#374151;line-height:1.6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
                      Enter this code on the password reset page to set a new password. Do not share it with anyone.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:10px;font-size:0;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:10px 16px;background-color:#fff7ed;border-radius:8px;border-left:3px solid #f97316;">
                    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
                      If you did not request a password reset, please ignore this email. Your account is safe.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 40px 40px 40px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background:linear-gradient(90deg,#4f46e5 0%,#7c3aed 100%);border-radius:50px;box-shadow:0 4px 14px rgba(79,70,229,0.35);">
                    <a href="https://getxh.in" target="_blank" style="display:inline-block;padding:14px 40px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
                      Go to GETXH
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #eef0f6;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 40px 32px 40px;">
              <p style="margin:0 0 4px 0;font-size:12px;color:#9ca3af;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
                &copy; 2026 GETXH. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
                Need help? <a href="mailto:support@getxh.in" style="color:#6366f1;text-decoration:none;">support@getxh.in</a>
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
