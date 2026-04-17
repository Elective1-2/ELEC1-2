const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const db = require("./db");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.OAUTH_CALLBACK_URL;

// We use Passport purely to get Google profile, not for cookie sessions.
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    // Verify callback: find-or-create user
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const emailObj = (profile.emails && profile.emails[0]) || {};
        const email = emailObj.value || null;
        const emailVerified = emailObj.verified === true || emailObj.verified === "true";

        // Defensive: Google should provide email, but ensure it's present
        if (!email) {
          return done(null, false, { message: "Email not provided by Google" });
        }

        const googleId = profile.id;
        const name = profile.displayName || null;
        const avatarUrl =
          (profile.photos && profile.photos[0] && profile.photos[0].value) || null;

        // Try to find by google_id first
        const [byGoogle] = await db.query("SELECT * FROM users WHERE google_id = ? LIMIT 1", [
          googleId,
        ]);

        let user = byGoogle[0];

        if (!user) {
          // Try to find by email (user might have signed up via another method in future)
          const [byEmail] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
          user = byEmail[0];

          if (user) {
            // Link google_id to existing account
            await db.query("UPDATE users SET google_id = ?, updated_at = NOW() WHERE id = ?", [
              googleId,
              user.id,
            ]);
            user.google_id = googleId;
          } else {
            // Create new user
            const [insert] = await db.query(
              "INSERT INTO users (google_id, email, email_verified, name, avatar_url) VALUES (?, ?, ?, ?, ?)",
              [googleId, email, emailVerified ? 1 : 0, name, avatarUrl]
            );

            const [rows] = await db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [
              insert.insertId,
            ]);
            user = rows[0];
          }
        }

        // Update last_login_at
        await db.query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [user.id]);

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;