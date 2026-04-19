const router = require("express").Router();
const db = require("../config/db");

// Test database connection and schema
router.get("/", async (_req, res) => {
  try {
    // Test 1: Simple connection check
    const [connectionTest] = await db.query("SELECT 1 as connected");
    
    // Test 2: Count records in key tables to verify schema
    const [userCount] = await db.query("SELECT COUNT(*) as count FROM users");
    const [routeCount] = await db.query("SELECT COUNT(*) as count FROM routes");
    const [busCount] = await db.query("SELECT COUNT(*) as count FROM buses");
    const [tripCount] = await db.query("SELECT COUNT(*) as count FROM trips");
    const [authProviderCount] = await db.query("SELECT COUNT(*) as count FROM auth_providers");
    
    // Test 3: Get a few sample users (without sensitive data)
    const [sampleUsers] = await db.query(
      "SELECT user_id, email, full_name, role, is_active, created_at FROM users LIMIT 3"
    );
    
    // Test 4: Check auth_providers structure
    const [sampleAuthProviders] = await db.query(
      "SELECT auth_id, user_id, provider, is_email_verified, last_login_at FROM auth_providers LIMIT 3"
    );
    
    // Test 5: Test insert into a real table (optional - comment out if you don't want test data)
    // We'll skip actual inserts to avoid polluting data, but you can add a test user if needed
    
    res.json({
      success: true,
      database: "elective",
      timestamp: new Date().toISOString(),
      counts: {
        users: userCount[0].count,
        routes: routeCount[0].count,
        buses: busCount[0].count,
        trips: tripCount[0].count,
        auth_providers: authProviderCount[0].count,
      },
      samples: {
        users: sampleUsers,
        auth_providers: sampleAuthProviders,
      },
      connection: {
        status: "connected",
        test: connectionTest[0].connected === 1,
      },
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      sqlState: error.sqlState,
      code: error.code,
    });
  }
});

// Optional: Test insert for auth_providers relationship
router.post("/test-auth-link", async (req, res) => {
  const { email, google_sub, full_name } = req.body;
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Check if user exists
    const [existingUser] = await connection.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );
    
    let userId;
    
    if (existingUser.length === 0) {
      // Create test user
      const [userResult] = await connection.query(
        "INSERT INTO users (email, full_name, role, is_active) VALUES (?, ?, 'driver', 1)",
        [email, full_name || "Test User"]
      );
      userId = userResult.insertId;
      
      // Create auth_provider link
      await connection.query(
        `INSERT INTO auth_providers 
         (user_id, provider, google_sub, is_email_verified, last_login_at) 
         VALUES (?, 'google', ?, 1, NOW())`,
        [userId, google_sub]
      );
      
      await connection.commit();
      
      res.json({
        success: true,
        message: "Test user created and linked to Google",
        user_id: userId,
        email: email,
      });
    } else {
      await connection.rollback();
      res.json({
        success: false,
        message: "User already exists",
        user_id: existingUser[0].user_id,
      });
    }
  } catch (error) {
    await connection.rollback();
    console.error("Test auth link error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

// Verify the auth_providers relationship for a specific user
router.get("/verify-auth/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [results] = await db.query(
      `SELECT u.user_id, u.email, u.full_name, u.role, 
              ap.provider, ap.google_sub, ap.is_email_verified, ap.last_login_at
       FROM users u
       LEFT JOIN auth_providers ap ON u.user_id = ap.user_id
       WHERE u.user_id = ?`,
      [userId]
    );
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    res.json({
      success: true,
      user: results[0],
      has_google_auth: results[0].provider === 'google',
    });
  } catch (error) {
    console.error("Verify auth error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;