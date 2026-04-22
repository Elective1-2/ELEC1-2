const pool = require('../config/db');

/**
 * GET /api/admin/analytics/summary
 * Get summary statistics for a specific date
 */
async function getAnalyticsSummary(req, res) {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    // Total trips completed today
    const [completedTrips] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM trips 
       WHERE status = 'completed' 
         AND DATE(scheduled_departure) = ?`,
      [targetDate]
    );

    // Average passengers per trip today
    const [avgPassengers] = await pool.query(
      `SELECT AVG(pc.passenger_count) as avg_passengers
       FROM trips t
       JOIN passenger_counts pc ON t.trip_id = pc.trip_id
       WHERE t.status = 'completed' 
         AND DATE(t.scheduled_departure) = ?`,
      [targetDate]
    );

    // Total delays today (>5 min)
    const [totalDelays] = await pool.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(dh.delay_minutes), 0) as total_minutes
       FROM delay_history dh
       JOIN trips t ON dh.trip_id = t.trip_id
       WHERE DATE(t.scheduled_departure) = ?`,
      [targetDate]
    );

    // Active routes today
    const [activeRoutes] = await pool.query(
      `SELECT COUNT(DISTINCT route_id) as count
       FROM trips
       WHERE DATE(scheduled_departure) = ?`,
      [targetDate]
    );

    res.json({
      success: true,
      summary: {
        date: targetDate,
        completedTrips: completedTrips[0].count,
        avgPassengersPerTrip: Math.round(avgPassengers[0].avg_passengers || 0),
        delayedTrips: totalDelays[0].count,
        totalDelayMinutes: totalDelays[0].total_minutes,
        activeRoutes: activeRoutes[0].count
      }
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/admin/analytics/weekly-ridership
 * Get passenger counts for a specific week
 */
async function getWeeklyRidership(req, res) {
  const { weekOffset = 0 } = req.query;
  
  // Calculate week start (Monday) based on offset
  const today = new Date();
  const currentDay = today.getDay();
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysToMonday + (parseInt(weekOffset) * 7));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  try {
    const [results] = await pool.query(
      `SELECT 
        DATE(t.scheduled_departure) as trip_date,
        DAYNAME(t.scheduled_departure) as day_name,
        COALESCE(SUM(pc.passenger_count), 0) as total_passengers,
        COUNT(DISTINCT t.trip_id) as trip_count
       FROM trips t
       LEFT JOIN passenger_counts pc ON t.trip_id = pc.trip_id
       WHERE t.status = 'completed'
         AND DATE(t.scheduled_departure) BETWEEN ? AND ?
       GROUP BY DATE(t.scheduled_departure), DAYNAME(t.scheduled_departure)
       ORDER BY DATE(t.scheduled_departure)`,
      [weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]]
    );

    // Fill in missing days with zeros
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const data = daysOfWeek.map(day => {
      const found = results.find(r => r.day_name === day);
      return {
        day: day.slice(0, 3),
        fullDay: day,
        passengers: found ? parseInt(found.total_passengers) : 0,
        trips: found ? found.trip_count : 0
      };
    });

    res.json({
      success: true,
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      data
    });
  } catch (error) {
    console.error('Weekly ridership error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/admin/analytics/delay-history
 * Get delay data for a specific week
 */
async function getDelayHistory(req, res) {
  const { weekOffset = 0 } = req.query;
  
  // Calculate week start (Monday)
  const today = new Date();
  const currentDay = today.getDay();
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysToMonday + (parseInt(weekOffset) * 7));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  try {
    const [results] = await pool.query(
      `SELECT 
        DATE(t.scheduled_departure) as trip_date,
        DAYNAME(t.scheduled_departure) as day_name,
        COUNT(dh.delay_id) as delayed_trips,
        COALESCE(SUM(dh.delay_minutes), 0) as total_delay_minutes
       FROM trips t
       LEFT JOIN delay_history dh ON t.trip_id = dh.trip_id
       WHERE DATE(t.scheduled_departure) BETWEEN ? AND ?
       GROUP BY DATE(t.scheduled_departure), DAYNAME(t.scheduled_departure)
       ORDER BY DATE(t.scheduled_departure)`,
      [weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]]
    );

    // Fill in missing days with zeros
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const data = daysOfWeek.map(day => {
      const found = results.find(r => r.day_name === day);
      return {
        day: day.slice(0, 3),
        fullDay: day,
        delayedTrips: found ? found.delayed_trips : 0,
        delayMinutes: found ? parseInt(found.total_delay_minutes) : 0
      };
    });

    res.json({
      success: true,
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      data
    });
  } catch (error) {
    console.error('Delay history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/admin/analytics/route-performance
 * Get route performance for last N days
 */
async function getRoutePerformance(req, res) {
  const { days = 7 } = req.query;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  startDate.setHours(0, 0, 0, 0);

  try {
    const [results] = await pool.query(
      `SELECT 
        r.route_id,
        r.name as route_name,
        COALESCE(SUM(rp.total_passengers), 0) as total_passengers,
        COUNT(DISTINCT rp.trip_id) as trip_count,
        ROUND(AVG(rp.total_passengers), 1) as avg_passengers
       FROM routes r
       LEFT JOIN route_performance rp ON r.route_id = rp.route_id 
         AND rp.trip_date >= ?
       WHERE r.is_active = 1
       GROUP BY r.route_id, r.name
       HAVING total_passengers > 0
       ORDER BY total_passengers DESC
       LIMIT 10`,
      [startDate.toISOString().split('T')[0]]
    );

    res.json({
      success: true,
      period: `${days} days`,
      startDate: startDate.toISOString().split('T')[0],
      data: results
    });
  } catch (error) {
    console.error('Route performance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/admin/analytics/trip-history
 * Get paginated trip history with filters
 */
async function getTripHistory(req, res) {
  const { 
    page = 1, 
    limit = 10, 
    bus = '', 
    route = '', 
    dateStart = '', 
    dateEnd = '' 
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  // Build WHERE clause dynamically
  let whereConditions = ["t.status = 'completed'"];
  let queryParams = [];
  
  if (bus) {
    whereConditions.push("b.bus_number LIKE ?");
    queryParams.push(`%${bus}%`);
  }
  
  if (route) {
    whereConditions.push("r.route_id = ?");
    queryParams.push(route);
  }
  
  if (dateStart) {
    whereConditions.push("DATE(t.scheduled_departure) >= ?");
    queryParams.push(dateStart);
  }
  
  if (dateEnd) {
    whereConditions.push("DATE(t.scheduled_departure) <= ?");
    queryParams.push(dateEnd);
  }
  
  const whereClause = whereConditions.join(' AND ');

  try {
    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total
       FROM trips t
       JOIN buses b ON t.bus_id = b.bus_id
       JOIN routes r ON t.route_id = r.route_id
       WHERE ${whereClause}`,
      queryParams
    );
    
    const total = countResult[0].total;
    
    // Get paginated data
    const [trips] = await pool.query(
      `SELECT 
        t.trip_id,
        b.bus_number,
        b.plate_number,
        r.name as route_name,
        r.route_id,
        t.scheduled_departure,
        t.actual_departure,
        t.actual_arrival,
        t.status,
        pc.passenger_count,
        pc.is_overflow,
        dh.delay_minutes,
        u.full_name as driver_name
       FROM trips t
       JOIN buses b ON t.bus_id = b.bus_id
       JOIN routes r ON t.route_id = r.route_id
       JOIN users u ON t.driver_id = u.user_id
       LEFT JOIN passenger_counts pc ON t.trip_id = pc.trip_id
       LEFT JOIN delay_history dh ON t.trip_id = dh.trip_id
       WHERE ${whereClause}
       ORDER BY t.scheduled_departure DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), offset]
    );

    res.json({
      success: true,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      data: trips
    });
  } catch (error) {
    console.error('Trip history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/admin/analytics/routes-with-trips
 * Get routes that have completed trips (for filter dropdown)
 */
async function getRoutesWithTrips(req, res) {
  try {
    const [routes] = await pool.query(
      `SELECT DISTINCT r.route_id, r.name
       FROM routes r
       JOIN trips t ON r.route_id = t.route_id
       WHERE t.status = 'completed'
       ORDER BY r.name`
    );

    res.json({
      success: true,
      routes
    });
  } catch (error) {
    console.error('Get routes with trips error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAnalyticsSummary,
  getWeeklyRidership,
  getDelayHistory,
  getRoutePerformance,
  getTripHistory,
  getRoutesWithTrips
};