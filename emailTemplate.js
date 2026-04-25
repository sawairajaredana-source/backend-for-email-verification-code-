export function getVerifyEmailTemplate(otp) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email – GETXH</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:32px;font-weight:900;color:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;letter-spacing:-1px;">get</span><span style="font-size:36px;font-weight:900;color:#1d7fe5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">X</span><span style="font-size:32px;font-weight:900;color:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">h</span><span style="font-size:18px;font-weight:700;color:#94a3b8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">.in</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#1e293b;border-radius:16px;padding:36px 32px;">

              <table width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- Title -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <p style="margin:0;font-size:20px;font-weight:700;color:#f1f5f9;">Your verification code is:</p>
                  </td>
                </tr>

                <!-- OTP -->
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color:#0f172a;border-radius:12px;">
                      <tr>
                        <td align="center" style="padding:20px 40px;">
                          <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#ffffff;font-family:'Courier New',Courier,monospace;">${otp}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Expiry -->
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <p style="margin:0;font-size:14px;color:#94a3b8;">This code expires in <strong style="color:#a78bfa;">5 minutes</strong>.</p>
                  </td>
                </tr>

                <!-- Warning -->
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">If you did not request this, please ignore this email.</p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#475569;">&copy; 2026 GETXH. All rights reserved.</p>
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
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password – GETXH</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:32px;font-weight:900;color:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;letter-spacing:-1px;">get</span><span style="font-size:36px;font-weight:900;color:#1d7fe5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">X</span><span style="font-size:32px;font-weight:900;color:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">h</span><span style="font-size:18px;font-weight:700;color:#94a3b8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">.in</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#1e293b;border-radius:16px;padding:36px 32px;">

              <table width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- Title -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <p style="margin:0;font-size:20px;font-weight:700;color:#f1f5f9;">Your password reset code is:</p>
                  </td>
                </tr>

                <!-- OTP -->
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color:#0f172a;border-radius:12px;">
                      <tr>
                        <td align="center" style="padding:20px 40px;">
                          <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#ffffff;font-family:'Courier New',Courier,monospace;">${otp}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Expiry -->
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <p style="margin:0;font-size:14px;color:#94a3b8;">This code expires in <strong style="color:#f87171;">5 minutes</strong>.</p>
                  </td>
                </tr>

                <!-- Warning -->
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">If you did not request a password reset, please ignore this email.</p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#475569;">&copy; 2026 GETXH. All rights reserved.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
