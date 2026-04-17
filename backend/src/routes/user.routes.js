const router = require("express").Router();
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

// Return the current user (from DB) using JWT payload
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const [rows] = await db.query("SELECT id, email, name, avatar_url, last_login_at FROM users WHERE id = ? LIMIT 1", [userId]);
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

module.exports = router;