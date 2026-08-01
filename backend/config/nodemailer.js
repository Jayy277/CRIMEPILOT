const nodemailer = require('nodemailer');
require('dotenv').config();

const emailUser = (process.env.EMAIL_USER || '').trim();
const emailPass = (process.env.EMAIL_PASS || '').trim();

if (!emailUser || !emailPass) {
  console.error('❌ [Nodemailer Config Error] EMAIL_USER or EMAIL_PASS environment variables are missing in backend/.env');
} else {
  console.log('[Nodemailer transporter created]');
  console.log('  - EMAIL_USER:', emailUser);
  console.log('  - EMAIL_PASS status: Loaded (' + emailPass.length + ' chars)');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;
