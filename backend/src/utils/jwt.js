const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

/**
 * Issue a signed JWT for the given user object (minimal payload).
 */
function signUser(user) {
  // Keep payload small; include only what you need on the client
  const payload = { sub: user.id, email: user.email, name: user.name };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a token string; throws if invalid/expired.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signUser, verifyToken };