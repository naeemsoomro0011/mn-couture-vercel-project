const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (16 chars) — NOT the normal account password
  },
});

const SHOP_NAME = 'MN Couture';

const wrapper = (bodyHtml) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background:#0c1416; border-radius:18px; overflow:hidden; border:1px solid #24303380;">
    <div style="background: linear-gradient(135deg,#6D28D9 0%,#DB2777 100%); padding: 30px 24px; text-align:center;">
      <h1 style="color:#fff; margin:0; font-size:22px; letter-spacing:0.5px; font-family: Georgia, serif;">${SHOP_NAME}</h1>
    </div>
    <div style="padding: 28px 24px; color:#eef2f1;">
      ${bodyHtml}
    </div>
    <div style="padding: 16px 24px; text-align:center; color:#7c8a87; font-size:12px; border-top:1px solid #24303380;">
      This email was sent automatically by ${SHOP_NAME}.
    </div>
  </div>
`;

const sendOTPEmail = async ({ to, otp, purpose = 'Verification' }) => {
  const html = wrapper(`
    <p style="font-size:15px;">Your ${purpose} code:</p>
    <p style="font-size:34px; font-weight:700; letter-spacing:8px; text-align:center; color:#fff; background:#141d20; padding:16px; border-radius:12px; margin:16px 0;">${otp}</p>
    <p style="font-size:13px; color:#94a3a0;">This code will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
  `);

  await transporter.sendMail({
    from: `"${SHOP_NAME}" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} — Your ${purpose} Code | ${SHOP_NAME}`,
    html,
  });
};

const sendLoginNotificationEmail = async ({ to, name }) => {
  const html = wrapper(`
    <p style="font-size:15px;">Hello ${name},</p>
    <p style="font-size:14px; color:#cdd6d4;">Your account was just logged into on ${SHOP_NAME}.</p>
    <p style="font-size:13px; color:#94a3a0;">If this wasn't you, please change your password immediately.</p>
  `);

  await transporter.sendMail({
    from: `"${SHOP_NAME}" <${process.env.EMAIL_USER}>`,
    to,
    subject: `New Login Detected | ${SHOP_NAME}`,
    html,
  });
};

const sendPasswordChangedEmail = async ({ to, name }) => {
  const html = wrapper(`
    <p style="font-size:15px;">Hello ${name},</p>
    <p style="font-size:14px; color:#cdd6d4;">Your password was just changed on ${SHOP_NAME}.</p>
    <p style="font-size:13px; color:#94a3a0;">If you didn't make this change, please contact us immediately.</p>
  `);

  await transporter.sendMail({
    from: `"${SHOP_NAME}" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Password Was Changed | ${SHOP_NAME}`,
    html,
  });
};

module.exports = { sendOTPEmail, sendLoginNotificationEmail, sendPasswordChangedEmail };
