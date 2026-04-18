const { verifyToken } = require("../utils/jwt");

/**
 * Reads JWT from HttpOnly cookie `token` (recommended) or from Authorization header as fallback.
 */
function requireAuth(req, res, next) {
  try {
    const cookieToken = req.cookies && req.cookies.token;
    const header = req.headers.authorization || "";
    const bearerToken = header.startsWith("Bearer ") ? header.slice(7) : null;

    const token = cookieToken || bearerToken;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const payload = verifyToken(token);
    req.user = payload; // attach minimal user info
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };