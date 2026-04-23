const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

/**
 * Send verification code email to admin
 * @param {string} adminEmail - Admin's email address
 * @param {string} adminName - Admin's name
 * @param {string} code - 6-digit verification code
 * @param {object} newUserInfo - Info about the user trying to sign up
 */
const sendVerificationCode = async (adminEmail, adminName, code, newUserInfo) => {
  const mailOptions = {
    from: `"M2B System" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: '🔐 New Driver Signup - Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Driver Registration Request</h2>
        <p>Hello ${adminName},</p>
        <p>A new user is trying to register as a driver. Please verify this request by sharing the code below:</p>
        
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="font-size: 48px; letter-spacing: 8px; color: #2563eb; margin: 0;">${code}</h1>
        </div>
        
        <h3>New User Information:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Name:</strong> ${newUserInfo.fullName}</li>
          <li><strong>Email:</strong> ${newUserInfo.email}</li>
          <li><strong>Email Verified by Google:</strong> ${newUserInfo.isEmailVerified ? '✅ Yes' : '❌ No'}</li>
        </ul>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This code will expire in 10 minutes. If you did not expect this request, please ignore this email.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = { sendVerificationCode };