const db = require('../config/db');
const googleMaps = require('../services/googleMaps.service');

/**
 * Driver updates bus location
 * POST /api/location/update
 * Body: { tripId, latitude, longitude, speed, heading, accuracy }
 */
exports.updateDriverLocation = async (req, res) => {
  const { tripId, latitude, longitude, speed, heading, accuracy } = req.body;
  const driverId = req.user.user_id; // from auth middleware

  // Validation
  if (!tripId || !latitude || !longitude) {
    return res.status(400).json({ 
      error: 'Missing required fields: tripId, latitude, longitude' 
    });
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  try {
    // Verify driver is assigned to this trip
    const [tripCheck] = await db.execute(
      `SELECT t.trip_id, t.status, t.bus_id, b.bus_number
       FROM trips t 
       JOIN buses b ON t.bus_id = b.bus_id 
       WHERE t.trip_id = ? AND t.driver_id = ? AND t.status IN ('scheduled', 'en_route')`,
      [tripId, driverId]
    );

    if (tripCheck.length === 0) {
      return res.status(403).json({ 
        error: 'You are not authorized for this trip or trip is already completed' 
      });
    }

    // Optional: Snap to road for cleaner tracking
    let finalLat = latitude;
    let finalLng = longitude;
    
    if (process.env.SNAP_TO_ROAD === 'true') {
      const snapped = await googleMaps.snapToRoad(latitude, longitude);
      finalLat = snapped.lat;
      finalLng = snapped.lng;
    }

    // Insert location into live_locations table
    await db.execute(
      `INSERT INTO live_locations 
       (trip_id, latitude, longitude, speed, heading, accuracy_m, reported_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [tripId, finalLat, finalLng, speed || null, heading || null, accuracy || null]
    );

    // Update trip status to 'en_route' if it's still 'scheduled'
    if (tripCheck[0].status === 'scheduled') {
      await db.execute(
        `UPDATE trips SET status = 'en_route', actual_departure = NOW() 
         WHERE trip_id = ?`,
        [tripId]
      );
    }

    // Clean up old locations (keep last 24 hours of data)
    await db.execute(
      `DELETE FROM live_locations 
       WHERE reported_at < NOW() - INTERVAL 24 HOUR`
    );

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        tripId: parseInt(tripId),
        busNumber: tripCheck[0].bus_number,
        location: { lat: finalLat, lng: finalLng },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Geolocation] Update error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

/**
 * Get latest location for a specific trip
 * GET /api/location/trip/:tripId/latest
 */
exports.getLatestLocation = async (req, res) => {
  const { tripId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT ll.latitude, ll.longitude, ll.speed, ll.heading, ll.reported_at,
              b.bus_number, t.status
       FROM live_locations ll
       JOIN trips t ON ll.trip_id = t.trip_id
       JOIN buses b ON t.bus_id = b.bus_id
       WHERE ll.trip_id = ?
       ORDER BY ll.reported_at DESC
       LIMIT 1`,
      [tripId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No location data found for this trip' });
    }

    const location = rows[0];
    res.json({
      tripId: parseInt(tripId),
      busNumber: location.bus_number,
      tripStatus: location.status,
      location: {
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude)
      },
      speed: location.speed ? parseFloat(location.speed) : null,
      heading: location.heading,
      reportedAt: location.reported_at,
      isRecent: new Date(location.reported_at) > new Date(Date.now() - 5 * 60 * 1000)
    });
  } catch (error) {
    console.error('[Geolocation] Get location error:', error);
    res.status(500).json({ error: 'Failed to get location' });
  }
};

/**
 * Get location history for a trip (last hour)
 * GET /api/location/trip/:tripId/history
 */
exports.getLocationHistory = async (req, res) => {
  const { tripId } = req.params;
  const { hours = 1 } = req.query;

  try {
    const [rows] = await db.execute(
      `SELECT latitude, longitude, speed, heading, reported_at
       FROM live_locations
       WHERE trip_id = ? AND reported_at > NOW() - INTERVAL ? HOUR
       ORDER BY reported_at ASC`,
      [tripId, hours]
    );

    res.json({
      tripId: parseInt(tripId),
      history: rows.map(row => ({
        lat: parseFloat(row.latitude),
        lng: parseFloat(row.longitude),
        speed: row.speed ? parseFloat(row.speed) : null,
        reportedAt: row.reported_at
      })),
      count: rows.length
    });
  } catch (error) {
    console.error('[Geolocation] History error:', error);
    res.status(500).json({ error: 'Failed to get location history' });
  }
};