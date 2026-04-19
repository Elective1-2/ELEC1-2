const mapsService = require('../services/maps.service');
const pool = require('../config/db');

/**
 * GET /api/maps/eta
 * Get ETA between two locations with traffic
 * Query params: origin, destination, tripId (optional)
 */
async function getETA(req, res) {
  const { origin, destination, tripId } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'origin and destination are required' });
  }

  try {
    const eta = await mapsService.getETAWithTraffic(origin, destination, 'now');
    
    // If tripId provided, also get congestion info from database
    let congestionMultiplier = 1.0;
    if (tripId) {
      const [congestion] = await pool.query(
        `SELECT congestion_level
         FROM congestion_logs
         WHERE trip_id = ?
         ORDER BY reported_at DESC
         LIMIT 1`,
        [tripId]
      );
      
      if (congestion.length > 0) {
        const multipliers = { low: 1.0, medium: 1.3, high: 1.6, full: 2.0 };
        congestionMultiplier = multipliers[congestion[0].congestion_level] || 1.0;
      }
    }
    
    res.json({
      success: true,
      origin,
      destination,
      eta_minutes: Math.round(eta.etaMinutes * congestionMultiplier),
      eta_text: eta.etaText,
      distance: eta.distance,
      with_traffic: true,
      congestion_multiplier: congestionMultiplier,
    });
  } catch (error) {
    console.error('ETA error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/maps/directions
 * Get turn-by-turn directions
 * Query params: origin, destination, waypoints (comma-separated)
 */
async function getDirections(req, res) {
  const { origin, destination, waypoints } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'origin and destination are required' });
  }

  const waypointsArray = waypoints ? waypoints.split(',') : [];

  try {
    const directions = await mapsService.getDirections(origin, destination, waypointsArray);
    res.json({ success: true, ...directions });
  } catch (error) {
    console.error('Directions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/maps/geocode
 * Convert address to coordinates
 * Body: { address }
 */
async function geocode(req, res) {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'address is required' });
  }

  try {
    const result = await mapsService.geocodeAddress(address);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Geocode error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/maps/reverse-geocode
 * Convert coordinates to address
 * Body: { lat, lng }
 */
async function reverseGeocode(req, res) {
  const { lat, lng } = req.body;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  try {
    const address = await mapsService.reverseGeocode(lat, lng);
    res.json({ success: true, address });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getETA,
  getDirections,
  geocode,
  reverseGeocode,
};