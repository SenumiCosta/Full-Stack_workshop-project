const nodemailer = require('nodemailer');

let cachedTransporter = null;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    return cachedTransporter;
  }

  // Fast fallback / development Ethereal account
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    return cachedTransporter;
  } catch (err) {
    console.warn('Could not connect to Ethereal SMTP, using console mock transport:', err.message);
    return null;
  }
};

const sendInvitationEmail = async ({ to, inviterName, orgName, inviteLink }) => {
  console.log(`\n========================================`);
  console.log(`📧 [INVITATION EMAIL]`);
  console.log(`To: ${to}`);
  console.log(`From: SyncBoard <noreply@syncboard.dev>`);
  console.log(`Subject: Invitation to join ${orgName} on SyncBoard`);
  console.log(`Inviter: ${inviterName}`);
  console.log(`🔗 Link: ${inviteLink}`);
  console.log(`========================================\n`);

  try {
    const transporter = await getTransporter();
    if (!transporter) {
      return { success: true, previewUrl: null, mocked: true };
    }

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 26px; font-weight: 700; color: #6366f1; margin: 0;">SyncBoard</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Collaborative Task Management</p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.03); padding: 24px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 24px;">
          <h2 style="font-size: 18px; margin: 0 0 12px 0; color: #ffffff;">You've been invited to join an organization!</h2>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
            <strong>${inviterName}</strong> has invited you to collaborate as a member of <strong>${orgName}</strong> on SyncBoard.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${inviteLink}" style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
              Accept Invitation & Join
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            Or copy and paste this link into your browser:<br/>
            <a href="${inviteLink}" style="color: #818cf8; word-break: break-all;">${inviteLink}</a>
          </p>
        </div>

        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
          This invitation was sent to ${to}. If you did not expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"SyncBoard" <${process.env.SMTP_FROM || 'noreply@syncboard.dev'}>`,
      to,
      subject: `Invitation to join ${orgName} on SyncBoard`,
      html: htmlContent
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Ethereal Email Preview: ${previewUrl}`);
    }

    return { success: true, previewUrl, messageId: info.messageId };
  } catch (error) {
    console.error('Email dispatch warning (will fallback to direct link):', error.message);
    return { success: true, previewUrl: null, error: error.message };
  }
};

module.exports = { sendInvitationEmail };
