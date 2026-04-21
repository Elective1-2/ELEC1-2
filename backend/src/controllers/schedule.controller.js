const pool = require('../config/db');

/**
 * GET /api/schedules/:routeId
 * Returns complete schedule data for a route
 * Query params: day_type (weekday, weekend, daily) - defaults to weekday
 */
async function getRouteSchedule(req, res) {
  const { routeId } = req.params;
  const { day_type = 'weekday' } = req.query;

  try {
    // 1. Get route basic info
    const [routes] = await pool.query(
      `SELECT route_id, name, start_location, end_location, 
              start_time, end_time, return_start_time, return_end_time, operating_days,
              distance_km, base_duration_minutes
       FROM routes 
       WHERE route_id = ? AND is_active = 1`,
      [routeId]
    );

    if (routes.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const route = routes[0];

    // 2. Get departure schedules for to_end direction (A → B)
    const [toEndSchedules] = await pool.query(
      `SELECT departure_time, schedule_id
       FROM route_schedules
       WHERE route_id = ? AND direction = 'to_end' AND day_type = ? AND is_active = 1
       ORDER BY departure_time ASC`,
      [routeId, day_type]
    );

    // 3. Get departure schedules for to_start direction (B → A)
    const [toStartSchedules] = await pool.query(
      `SELECT departure_time, schedule_id
       FROM route_schedules
       WHERE route_id = ? AND direction = 'to_start' AND day_type = ? AND is_active = 1
       ORDER BY departure_time ASC`,
      [routeId, day_type]
    );

    // 4. Return combined response
    res.json({
      success: true,
      route: {
        id: route.route_id,
        name: route.name,
        startLocation: route.start_location,
        endLocation: route.end_location,
        operatingDays: route.operating_days,
        startTime: route.start_time,
        endTime: route.end_time,
        returnStartTime: route.return_start_time,
        returnEndTime: route.return_end_time,
        distanceKm: route.distance_km,
        baseDurationMinutes: route.base_duration_minutes,
      },
      schedules: {
        toEnd: toEndSchedules.map(s => s.departure_time),
        toStart: toStartSchedules.map(s => s.departure_time),
      },
      dayType: day_type,
    });
  } catch (error) {
    console.error('Get route schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/schedules
 * Returns all active routes with basic info (for dropdown)
 */
async function getAllRoutesSimple(req, res) {
  try {
    const [routes] = await pool.query(
      `SELECT route_id, name, start_location, end_location, operating_days
       FROM routes 
       WHERE is_active = 1
       ORDER BY route_id`
    );
    res.json({ success: true, routes });
  } catch (error) {
    console.error('Get all routes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getRouteSchedule,
  getAllRoutesSimple,
};