const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const passport = require("../config/passport");
const { signUser } = require("../utils/jwt");

// Rate limit auth endpoints to reduce abuse
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

router.use(authLimiter);

// 1) Kick off Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// 2) Handle Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/failure" }),
  async (req, res) => {
    // Passport attached `req.user` from our strategy
    const user = req.user;

    // Issue JWT
    const token = signUser(user);

    // Set cookie (HttpOnly); in production also set `secure: true` and `sameSite: "none"` if cross-site
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,           // true on HTTPS
      sameSite: isProd ? "none" : "lax",
      maxAge: 60 * 60 * 1000,   // 1h in ms
    });

    // Redirect back to frontend (e.g., /dashboard)
    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontend}/auth/success`);
  }
);

// 3) Failure route (optional)
router.get("/failure", (_req, res) => {
  res.status(401).json({ error: "Google authentication failed" });
});

// 4) Logout (clear cookie)
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

module.exports = router;