const pool = require('../config/db');
const mapsService = require('../services/maps.service');

/**
 * GET /api/routes
 * List all routes
 */
async function getAllRoutes(req, res) {
  try {
    const [routes] = await pool.query(
      'SELECT * FROM routes WHERE is_active = 1 ORDER BY name'
    );
    res.json({ success: true, routes });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/routes/:routeId
 * Get route by ID
 */
async function getRouteById(req, res) {
  const { routeId } = req.params;

  try {
    const [routes] = await pool.query(
      'SELECT * FROM routes WHERE route_id = ?',
      [routeId]
    );

    if (routes.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({ success: true, route: routes[0] });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/routes
 * Create new route (admin only)
 * Body: { name, start_location, end_location, direction, distance_km, base_duration_minutes }
 */
async function createRoute(req, res) {
  const { name, start_location, end_location, direction, distance_km, base_duration_minutes } = req.body;

  if (!name || !start_location || !end_location || !direction || !base_duration_minutes) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Optionally get distance from Google Maps if not provided
    let finalDistanceKm = distance_km;
    if (!finalDistanceKm) {
      const distance = await mapsService.getDistanceMatrix(start_location, end_location);
      finalDistanceKm = (distance.distanceMeters / 1000).toFixed(2);
    }

    const [result] = await pool.query(
      `INSERT INTO routes (name, start_location, end_location, direction, distance_km, base_duration_minutes, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [name, start_location, end_location, direction, finalDistanceKm, base_duration_minutes]
    );

    res.status(201).json({ success: true, routeId: result.insertId });
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * PUT /api/routes/:routeId
 * Update route
 */
async function updateRoute(req, res) {
  const { routeId } = req.params;
  const { name, start_location, end_location, direction, base_duration_minutes, is_active } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE routes 
       SET name = COALESCE(?, name),
           start_location = COALESCE(?, start_location),
           end_location = COALESCE(?, end_location),
           direction = COALESCE(?, direction),
           base_duration_minutes = COALESCE(?, base_duration_minutes),
           is_active = COALESCE(?, is_active)
       WHERE route_id = ?`,
      [name, start_location, end_location, direction, base_duration_minutes, is_active, routeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/routes/:routeId/congestion
 * Get congestion history for a route
 */
async function getRouteCongestion(req, res) {
  const { routeId } = req.params;

  try {
    const [congestion] = await pool.query(
      `SELECT congestion_level, reported_at, source
       FROM congestion_logs
       WHERE route_id = ?
       ORDER BY reported_at DESC
       LIMIT 50`,
      [routeId]
    );

    // Calculate average congestion for different time periods
    const now = new Date();
    const hourAgo = new Date(now - 60 * 60 * 1000);
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);

    const [recentCongestion] = await pool.query(
      `SELECT congestion_level, COUNT(*) as count
       FROM congestion_logs
       WHERE route_id = ? AND reported_at > ?
       GROUP BY congestion_level`,
      [routeId, hourAgo]
    );

    res.json({
      success: true,
      history: congestion,
      recent: recentCongestion,
    });
  } catch (error) {
    console.error('Get congestion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  getRouteCongestion,
};