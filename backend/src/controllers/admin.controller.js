const pool = require('../config/db');

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics
 */
async function getDashboardStats(req, res) {
  try {
    // Active buses count
    const [activeBuses] = await pool.query(
      'SELECT COUNT(*) as count FROM buses WHERE status = "active"'
    );

    // Active trips (en_route)
    const [activeTrips] = await pool.query(
      'SELECT COUNT(*) as count FROM trips WHERE status = "en_route"'
    );

    // Total trips today
    const [tripsToday] = await pool.query(
      `SELECT COUNT(*) as count FROM trips 
       WHERE DATE(scheduled_departure) = CURDATE()`
    );

    // Delayed trips
    const [delayedTrips] = await pool.query(
      `SELECT COUNT(*) as count FROM trips 
       WHERE status = 'delayed' AND DATE(scheduled_departure) = CURDATE()`
    );

    // Average passenger count today
    const [avgPassengers] = await pool.query(
      `SELECT AVG(pc.passenger_count) as avg_passengers
       FROM passenger_counts pc
       JOIN trips t ON pc.trip_id = t.trip_id
       WHERE DATE(t.scheduled_departure) = CURDATE()`
    );

    // Recent alerts (congestion high/full)
    const [recentAlerts] = await pool.query(
      `SELECT cl.*, r.name as route_name
       FROM congestion_logs cl
       JOIN routes r ON cl.route_id = r.route_id
       WHERE cl.congestion_level IN ('high', 'full')
         AND cl.reported_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
       ORDER BY cl.reported_at DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      stats: {
        activeBuses: activeBuses[0].count,
        activeTrips: activeTrips[0].count,
        tripsToday: tripsToday[0].count,
        delayedTrips: delayedTrips[0].count,
        avgPassengersToday: Math.round(avgPassengers[0].avg_passengers || 0),
      },
      recentAlerts,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/admin/analytics/passengers
 * Get passenger count analytics over time
 * Query params: period (day, week, month)
 */
async function getPassengerAnalytics(req, res) {
  const { period = 'day' } = req.query;
  
  let groupBy;
  let dateRange;
  
  switch (period) {
    case 'week':
      groupBy = 'DATE(t.scheduled_departure)';
      dateRange = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
      break;
    case 'month':
      groupBy = 'DATE(t.scheduled_departure)';
      dateRange = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
      break;
    default: // day
      groupBy = 'HOUR(t.scheduled_departure)';
      dateRange = 'DATE_SUB(NOW(), INTERVAL 24 HOUR)';
  }

  try {
    const [analytics] = await pool.query(
      `SELECT ${groupBy} as period,
              AVG(pc.passenger_count) as avg_passengers,
              MAX(pc.passenger_count) as max_passengers,
              COUNT(DISTINCT t.trip_id) as trip_count,
              SUM(CASE WHEN pc.is_overflow = 1 THEN 1 ELSE 0 END) as overflow_count
       FROM passenger_counts pc
       JOIN trips t ON pc.trip_id = t.trip_id
       WHERE t.scheduled_departure > ${dateRange}
       GROUP BY period
       ORDER BY period ASC`
    );

    res.json({ success: true, period, data: analytics });
  } catch (error) {
    console.error('Passenger analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/admin/congestion/report
 * Report congestion (can be automated or manual)
 * Body: { route_id, trip_id, congestion_level }
 */
async function reportCongestion(req, res) {
  const { route_id, trip_id, congestion_level } = req.body;

  if (!route_id || !congestion_level) {
    return res.status(400).json({ error: 'route_id and congestion_level required' });
  }

  const validLevels = ['low', 'medium', 'high', 'full'];
  if (!validLevels.includes(congestion_level)) {
    return res.status(400).json({ error: 'Invalid congestion level' });
  }

  try {
    await pool.query(
      `INSERT INTO congestion_logs (route_id, trip_id, congestion_level, source)
       VALUES (?, ?, ?, 'real_time')`,
      [route_id, trip_id || null, congestion_level]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Report congestion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getDashboardStats,
  getPassengerAnalytics,
  reportCongestion,
};