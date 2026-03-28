const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  console.log(`📧 Attempting email to: ${to}`);
  console.log(`📧 Subject: ${subject}`);
  
  if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your_app_password') {
    console.log('⚠️ EMAIL_PASS not configured. Email skipped.');
    console.log('📋 EMAIL CONTENT LOGGED:');
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'nithin58708@gmail.com',
        pass: process.env.EMAIL_PASS
      },
      tls: { rejectUnauthorized: false }
    });
    
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    const info = await transporter.sendMail({
      from: `"NextGen Hiring Platform" <${process.env.EMAIL_USER}>`,
      to, subject, html
    });
    console.log('✅ Email sent! ID:', info.messageId);
    return true;
  } catch (err) {
    console.error('❌ Email failed:', err.message);
    return false;
  }
};

module.exports = { sendEmail };
