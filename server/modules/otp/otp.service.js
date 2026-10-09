const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('../../config/env');

const generateEmailCode = () => crypto.randomInt(100000, 999999).toString();

let transporter = null;
const getTransporter = () => {
  if (transporter) return transporter;
  const { smtp } = config;
  if (smtp.host) {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });
  }
  return transporter;
};

const isProduction = process.env.NODE_ENV === 'production';

const sendEmailCode = async (email, code) => {
  const t = getTransporter();
  if (t) {
    try {
      await t.sendMail({
        from: config.smtp.from,
        to: email,
        subject: 'Your MeroAssets verification code',
        text: `Your MeroAssets verification code is: ${code}\n\nThis code expires in 5 minutes.`,
        html: `<p>Your MeroAssets verification code is:</p><h2 style="letter-spacing:4px;font-family:monospace">${code}</h2><p>This code expires in 5 minutes.</p>`,
      });
      console.log(`📧 Verification code sent to ${email}`);
    } catch (err) {
      console.error(`❎ Email send failed: ${err.message}`);
      if (!isProduction) console.log(`Verification code ${code} for ${email}`);
    }
    return;
  }

  // No SMTP configured — never write live codes to logs in production.
  if (isProduction) {
    console.error('❎ SMTP not configured; verification code was not delivered.');
    return;
  }
  console.log(`Verification code ${code} for ${email}`);
  console.log('⚠️  SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env for real email delivery.');
};

module.exports = { generateEmailCode, getTransporter, sendEmailCode };
