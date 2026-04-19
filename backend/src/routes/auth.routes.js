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

// 2) Handle Google callback - MODIFIED to handle no_account case
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      // Handle errors
      if (err) {
        console.error("OAuth error:", err);
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5000"}/auth/error?message=server_error`);
      }

      // Handle "no_account" case - redirect to signup with Google data
      if (info && info.message === "no_account" && info.googleData) {
        const { email, googleSub, fullName, isEmailVerified } = info.googleData;
        const signupUrl = `${process.env.FRONTEND_URL || "http://localhost:5000"}/auth/signup?` +
          `email=${encodeURIComponent(email)}&` +
          `google_sub=${encodeURIComponent(googleSub)}&` +
          `name=${encodeURIComponent(fullName || "")}&` +
          `verified=${isEmailVerified}`;
        return res.redirect(signupUrl);
      }

      // Handle other failures (deactivated account, etc.)
      if (!user) {
        const message = info?.message || "authentication_failed";
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5000"}/auth/error?message=${message}`);
      }

      // Success - user exists and is authenticated
      const token = signUser(user);
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 60 * 60 * 1000,
      });

      const frontend = process.env.FRONTEND_URL || "http://localhost:5000";
      res.redirect(`${frontend}/auth/success`);
    })(req, res, next);
  }
);

// 3) Failure route (fallback)
router.get("/failure", (_req, res) => {
  res.status(401).json({ error: "Google authentication failed" });
});

// 4) Logout (clear cookie)
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

module.exports = router;