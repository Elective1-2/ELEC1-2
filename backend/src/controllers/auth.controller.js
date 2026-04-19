const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

module.exports = {
  googleLogin,
  verifySecretAndSignup,
  getMe,
  logout
};