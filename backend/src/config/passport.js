const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const db = require("./db");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.OAUTH_CALLBACK_URL;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const emailObj = (profile.emails && profile.emails[0]) || {};
        const email = emailObj.value || null;
        const googleSub = profile.id;
        const fullName = profile.displayName || null;
        const isEmailVerified = emailObj.verified === true || emailObj.verified === "true";

        if (!email) {
          return done(null, false, { message: "Email not provided by Google" });
        }

        // Check if user exists in users table by email
        const [users] = await db.query(
          `SELECT user_id, email, full_name, phone, role, is_active 
           FROM users 
           WHERE email = ? 
           LIMIT 1`,
          [email]
        );

        let user = users[0];

        // NO USER FOUND → return special flag for frontend redirect to signup
        if (!user) {
          return done(null, false, {
            message: "no_account",
            googleData: {
              email,
              googleSub,
              fullName,
              isEmailVerified
            }
          });
        }

        // User exists but is inactive
        if (!user.is_active) {
          return done(null, false, { message: "Account is deactivated" });
        }

        // User exists → check/link auth_providers
        const [authProviders] = await db.query(
          `SELECT auth_id FROM auth_providers 
           WHERE user_id = ? AND provider = 'google' 
           LIMIT 1`,
          [user.user_id]
        );

        if (authProviders.length === 0) {
          // Link Google account to existing user
          await db.query(
            `INSERT INTO auth_providers 
             (user_id, provider, google_sub, is_email_verified, last_login_at) 
             VALUES (?, 'google', ?, ?, NOW())`,
            [user.user_id, googleSub, isEmailVerified ? 1 : 0]
          );
        } else {
          // Update existing auth_provider
          await db.query(
            `UPDATE auth_providers 
             SET google_sub = ?, 
                 is_email_verified = ?, 
                 last_login_at = NOW() 
             WHERE user_id = ? AND provider = 'google'`,
            [googleSub, isEmailVerified ? 1 : 0, user.user_id]
          );
        }

        // Return user without sensitive data
        const userResponse = {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          is_active: user.is_active
        };

        return done(null, userResponse);
      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err);
      }
    }
  )
);

module.exports = passport;