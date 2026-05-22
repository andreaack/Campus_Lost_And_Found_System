const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendClaimEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"Campus LAF" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

module.exports = { sendClaimEmail };