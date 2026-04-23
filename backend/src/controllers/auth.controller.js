const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const { sendVerificationCode } = require('../utils/emailService');   

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verificationCodes = new Map();     

// Helper: Generate JWT
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Google Login - checks if user exists
const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleSub, email, name, email_verified } = payload;

    // Check if user exists
    const [users] = await pool.query(
      `SELECT u.user_id, u.email, u.full_name, u.role
       FROM users u
       JOIN auth_providers ap ON u.user_id = ap.user_id
       WHERE ap.google_sub = ? OR u.email = ?`,
      [googleSub, email]
    );

    if (users.length > 0) {
      // Existing user - update last login and return JWT
      const user = users[0];
      
      await pool.query(
        `UPDATE auth_providers SET last_login_at = NOW()
         WHERE user_id = ? AND provider = 'google'`,
        [user.user_id]
      );

      const jwtToken = generateToken(user.user_id, user.email, user.role);

      return res.json({
        success: true,
        token: jwtToken,
        user: {
          userId: user.user_id,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        }
      });
    }

    // No account found - return google data for signup
    return res.status(404).json({
      success: false,
      needsSignup: true,
      googleData: {
        googleSub,
        email,
        fullName: name,
        isEmailVerified: email_verified
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ success: false, error: 'Google authentication failed' });
  }
};

// Verify secret code and complete signup
const verifySecretAndSignup = async (req, res) => {
  const { secretCode, googleData } = req.body;
  const { googleSub, email, fullName, isEmailVerified, role } = googleData;

  // Validate secret code against environment variable
  const validSecretCode = process.env.SIGNUP_SECRET_CODE || 'M2B2024';
  
  if (secretCode !== validSecretCode) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid secret code. Please contact your administrator.' 
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if user already exists (race condition protection)
    const [existing] = await connection.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ 
        success: false, 
        error: 'User already exists. Please try logging in.' 
      });
    }

    // Create new user (default role: 'driver' since they have secret code)
    const userRole = role || 'driver';
    const [userResult] = await connection.query(
      'INSERT INTO users (email, full_name, role, is_active) VALUES (?, ?, ?, 1)',
      [email, fullName, userRole]
    );

    // Create auth provider entry
    await connection.query(
      `INSERT INTO auth_providers 
       (user_id, provider, google_sub, is_email_verified, last_login_at)
       VALUES (?, 'google', ?, ?, NOW())`,
      [userResult.insertId, googleSub, isEmailVerified ? 1 : 0]
    );

    await connection.commit();

    // Generate JWT
    const jwtToken = generateToken(userResult.insertId, email, userRole);

    res.status(201).json({
      success: true,
      token: jwtToken,
      user: {
        userId: userResult.insertId,
        email,
        fullName,
        role: userRole
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    connection.release();
  }
};

// Get current user (protected)
const getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, email, full_name, phone, role FROM users WHERE user_id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Logout (frontend just discards token, but we can add blacklist later)
const logout = async (req, res) => {
  // For now, just acknowledge
  res.json({ success: true, message: 'Logged out successfully' });
};

// Helper: Generate 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper: Find first admin
const findFirstAdmin = async (connection) => {
  const [admins] = await connection.query(
    `SELECT user_id, email, full_name 
     FROM users 
     WHERE role = 'admin' AND is_active = 1 
     ORDER BY user_id ASC 
     LIMIT 1`
  );
  return admins.length > 0 ? admins[0] : null;
};

// Helper: Mask email
const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  const maskedLocal = local.slice(0, 2) + '***' + local.slice(-1);
  return `${maskedLocal}@${domain}`;
};

// Step 1: Initiate signup - Send verification code to admin
const initiateSignup = async (req, res) => {
  const { googleData } = req.body;
  const { googleSub, email, fullName, isEmailVerified } = googleData;

  if (!googleSub || !email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required Google data' 
    });
  }

  const connection = await pool.getConnection();

  try {
    const [existing] = await connection.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: 'User already exists. Please try logging in.' 
      });
    }

    const admin = await findFirstAdmin(connection);

    if (!admin) {
      return res.status(500).json({ 
        success: false, 
        error: 'No admin found in the system. Please contact support.' 
      });
    }

    const verificationCode = generateVerificationCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    verificationCodes.set(email, {
      code: verificationCode,
      expiresAt,
      googleData,
      adminEmail: admin.email,
      attempts: 0
    });

    await sendVerificationCode(
      admin.email,
      admin.full_name,
      verificationCode,
      { fullName, email, isEmailVerified }
    );

    res.json({
      success: true,
      message: 'Verification code sent to administrator',
      adminEmailMasked: maskEmail(admin.email)
    });

  } catch (error) {
    console.error('Initiate signup error:', error);
    if (error.message === 'Failed to send verification email') {
      verificationCodes.delete(email);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send verification email. Please try again later.' 
      });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } finally {
    connection.release();
  }
};

// Step 2: Verify code and complete signup
const verifyCodeAndSignup = async (req, res) => {
  const { code, email } = req.body;

  if (!code || !email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Verification code and email are required' 
    });
  }

  const stored = verificationCodes.get(email);

  if (!stored) {
    return res.status(404).json({ 
      success: false, 
      error: 'No pending signup found. Please start over.' 
    });
  }

  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email);
    return res.status(410).json({ 
      success: false, 
      error: 'Verification code has expired. Please request a new one.' 
    });
  }

  if (stored.attempts >= 5) {
    verificationCodes.delete(email);
    return res.status(429).json({ 
      success: false, 
      error: 'Too many failed attempts. Please start over.' 
    });
  }

  if (stored.code !== code) {
    stored.attempts += 1;
    verificationCodes.set(email, stored);
    const remainingAttempts = 5 - stored.attempts;
    return res.status(401).json({ 
      success: false, 
      error: `Invalid verification code. ${remainingAttempts} attempts remaining.` 
    });
  }

  const { googleData } = stored;
  const { googleSub, fullName, isEmailVerified } = googleData;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      await connection.rollback();
      verificationCodes.delete(email);
      return res.status(409).json({ 
        success: false, 
        error: 'User already exists. Please try logging in.' 
      });
    }

    const [userResult] = await connection.query(
      'INSERT INTO users (email, full_name, role, is_active) VALUES (?, ?, ?, 1)',
      [email, fullName, 'driver']
    );

    await connection.query(
      `INSERT INTO auth_providers 
       (user_id, provider, google_sub, is_email_verified, last_login_at)
       VALUES (?, 'google', ?, ?, NOW())`,
      [userResult.insertId, googleSub, isEmailVerified ? 1 : 0]
    );

    await connection.commit();
    verificationCodes.delete(email);

    const jwtToken = generateToken(userResult.insertId, email, 'driver');

    res.status(201).json({
      success: true,
      token: jwtToken,
      user: {
        userId: userResult.insertId,
        email,
        fullName,
        role: 'driver'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    connection.release();
  }
};

// Step 2 (Alternative): Resend verification code
const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const stored = verificationCodes.get(email);

  if (!stored) {
    return res.status(404).json({ 
      success: false, 
      error: 'No pending signup found. Please start over.' 
    });
  }

  const connection = await pool.getConnection();

  try {
    const admin = await findFirstAdmin(connection);

    if (!admin) {
      verificationCodes.delete(email);
      return res.status(500).json({ 
        success: false, 
        error: 'No admin found. Please contact support.' 
      });
    }

    const newCode = generateVerificationCode();
    const newExpiresAt = Date.now() + 10 * 60 * 1000;

    stored.code = newCode;
    stored.expiresAt = newExpiresAt;
    stored.attempts = 0;
    verificationCodes.set(email, stored);

    await sendVerificationCode(
      admin.email,
      admin.full_name,
      newCode,
      {
        fullName: stored.googleData.fullName,
        email,
        isEmailVerified: stored.googleData.isEmailVerified
      }
    );

    res.json({
      success: true,
      message: 'New verification code sent',
      adminEmailMasked: maskEmail(admin.email)
    });

  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ success: false, error: 'Failed to resend code' });
  } finally {
    connection.release();
  }
};

module.exports = {
  googleLogin,
  verifySecretAndSignup,      
  getMe,
  logout,
  initiateSignup,             
  verifyCodeAndSignup,        
  resendVerificationCode      
};