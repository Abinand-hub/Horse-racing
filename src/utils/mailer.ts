import nodemailer from 'nodemailer';

interface SendOtpParams {
  to: string;
  otp: string;
  username?: string;
}

interface MailResult {
  success: boolean;
  message: string;
  simulated?: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Creates and returns a Nodemailer transporter configured for Gmail SMTP.
 */
function getGmailTransporter() {
  const user = process.env.GMAIL_USER || process.env.EMAIL_USER || 'Turftactics2026@gmail.com';
  const rawPass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS || process.env.EMAIL_PASS || 'hqjy mzlv mdvz vysq';
  const pass = rawPass.replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Generates a luxury branded HTML email template for Turf Tactics / DerbyBet OTP.
 */
function buildOtpEmailHtml(otp: string, recipient: string, username?: string): string {
  const greeting = username ? `Hello <strong>${username}</strong>,` : 'Hello Bettor,';
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your DerbyBet OTP Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b1120;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      max-width: 560px;
      margin: 40px auto;
      background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
      border: 1px solid #1e293b;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%);
      padding: 24px;
      text-align: center;
      border-bottom: 2px solid #f59e0b;
    }
    .brand-title {
      color: #f59e0b;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 2px;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-sub {
      color: #94a3b8;
      font-size: 11px;
      letter-spacing: 1px;
      margin-top: 4px;
      text-transform: uppercase;
    }
    .content {
      padding: 36px 30px;
      text-align: center;
    }
    .greeting {
      font-size: 16px;
      color: #f8fafc;
      margin-bottom: 12px;
    }
    .message {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .otp-box {
      background: #090d16;
      border: 2px dashed #f59e0b;
      border-radius: 12px;
      padding: 20px 10px;
      margin: 20px 0 28px 0;
      display: inline-block;
      min-width: 240px;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #fbbf24;
      margin: 0;
      text-align: center;
      padding-left: 8px;
    }
    .validity-tag {
      display: inline-block;
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
      margin-top: 8px;
    }
    .security-note {
      font-size: 12px;
      color: #64748b;
      background: #0c1427;
      padding: 14px;
      border-radius: 8px;
      border-left: 3px solid #6366f1;
      text-align: left;
      margin-top: 20px;
      line-height: 1.5;
    }
    .footer {
      background: #050811;
      padding: 20px;
      text-align: center;
      font-size: 11px;
      color: #475569;
      border-top: 1px solid #1e293b;
    }
    .footer a {
      color: #f59e0b;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="brand-title">🏇 TURF TACTICS 2026</h1>
      <div class="brand-sub">Premium Horse Racing & Wagering Portal</div>
    </div>
    <div class="content">
      <div class="greeting">${greeting}</div>
      <p class="message">
        You requested a verification code to authenticate your account for <strong>${recipient}</strong>.
        Please enter the one-time password below to continue:
      </p>

      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="validity-tag">⏱ Valid for 10 minutes</div>
      </div>

      <div class="security-note">
        <strong>🔒 Security Notice:</strong> Never share this verification code with anyone. DerbyBet staff will never ask for your password or OTP. If you did not make this request, you can safely ignore this email.
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;">© 2026 Turf Tactics / DerbyBet Racing. All rights reserved.</p>
      <p style="margin: 0;">Automated notification • Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Sends a real OTP verification email via Gmail SMTP (or returns simulated OTP if credentials not yet configured).
 */
export async function sendOtpEmail({ to, otp, username }: SendOtpParams): Promise<MailResult> {
  const cleanEmail = to.trim().toLowerCase();
  const transporter = getGmailTransporter();

  if (!transporter) {
    const sender = process.env.GMAIL_USER || 'Not configured in .env';
    console.log(`\n======================================================`);
    console.log(`📧 [GMAIL OTP SIMULATOR - NO APP PASSWORD SET]`);
    console.log(`➡️  To: ${cleanEmail}`);
    console.log(`🔑  OTP Code: ${otp}`);
    console.log(`ℹ️  To send LIVE real emails to Gmail, add:`);
    console.log(`    GMAIL_USER="your-email@gmail.com"`);
    console.log(`    GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx" (16-char App Password)`);
    console.log(`    to your .env file.`);
    console.log(`======================================================\n`);

    return {
      success: true,
      simulated: true,
      message: `OTP generated for ${cleanEmail} (Simulated mode). Check console or enter OTP ${otp}`,
    };
  }

  try {
    const fromAddress = process.env.GMAIL_FROM || `"Turf Tactics DerbyBet" <${process.env.GMAIL_USER}>`;
    const info = await transporter.sendMail({
      from: fromAddress,
      to: cleanEmail,
      subject: `🏇 ${otp} is your Turf Tactics / DerbyBet verification code`,
      text: `Your Turf Tactics verification code is: ${otp}. It is valid for 10 minutes. Do not share this code.`,
      html: buildOtpEmailHtml(otp, cleanEmail, username),
    });

    console.log(`\n======================================================`);
    console.log(`✅ [GMAIL OTP DELIVERED SUCCESSFULLY]`);
    console.log(`➡️  To: ${cleanEmail}`);
    console.log(`🔑  OTP Code: ${otp}`);
    console.log(`📨  Message ID: ${info.messageId}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
      message: `Verification code sent to ${cleanEmail}. Please check your Gmail inbox and spam/promotions tab.`,
    };
  } catch (err: any) {
    console.error(`❌ [GMAIL SMTP SEND ERROR]:`, err.message || err);
    return {
      success: false,
      simulated: true,
      error: err.message || 'Failed to send email via Gmail SMTP',
      message: `Email sending encountered an error: ${err.message}. Fallback code: ${otp}`,
    };
  }
}
