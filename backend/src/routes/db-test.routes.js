const router = require("express").Router();
const db = require("../config/db");

router.get("/", async (_req, res) => {
  try {
    // Insert test data
    const [insertResult] = await db.query(
      "INSERT INTO test_connection (message) VALUES (?)",
      ["✅ Database connected successfully"]
    );

    // Read latest rows
    const [rows] = await db.query(
      "SELECT * FROM test_connection ORDER BY id DESC LIMIT 5"
    );

    res.json({
      success: true,
      insertedId: insertResult.insertId,
      recentRows: rows,
    });
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({
      success: false,
      error: "Database connection failed",
    });
  }
});

module.exports = router;