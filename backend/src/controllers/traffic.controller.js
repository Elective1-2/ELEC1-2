const db = require('../config/db');
const googleMaps = require('../services/googleMaps.service');

/**
 * Get ETA for a specific trip with real-time traffic
 * GET /api/traffic/trip/:tripId/eta
 */
exports.getTripETA = async (req, res) => {
  const { tripId } = req.params;

  try {
    // Get trip details with latest location and route info
    const [tripRows] = await db.execute(
      `SELECT 
         t.trip_id, 
         t.status, 
         t.scheduled_departure,
         r.route_id,
         r.name as route_name,
         r.end_location,
         r.distance_km as route_distance,
         r.base_duration_minutes,
         ll.latitude, 
         ll.longitude,
         ll.reported_at as last_location_time,
         b.bus_number
       FROM trips t
       JOIN routes r ON t.route_id = r.route_id
       JOIN buses b ON t.bus_id = b.bus_id
       LEFT JOIN (
         SELECT trip_id, latitude, longitude, reported_at
         FROM live_locations
         WHERE trip_id = ?
         ORDER BY reported_at DESC
         LIMIT 1
       ) ll ON t.trip_id = ll.trip_id
       WHERE t.trip_id = ?`,
      [tripId, tripId]
    );

    if (tripRows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const trip = tripRows[0];

    // Check if we have live location
    if (!trip.latitude || !trip.longitude) {
      return res.status(404).json({ 
        error: 'No live location available for this bus yet',
        tripStatus: trip.status
      });
    }

    // Check if location is stale (> 5 minutes old)
    const isStale = new Date(trip.last_location_time) < new Date(Date.now() - 5 * 60 * 1000);
    if (isStale) {
      return res.status(202).json({
        warning: 'Location data is stale (more than 5 minutes old)',
        tripId: parseInt(tripId),
        lastLocationTime: trip.last_location_time,
        ...trip
      });
    }

    // Geocode destination (cache this in routes table in production)
    let destCoords = null;
    
    // Try to get from cached coordinates first
    const [routeCoords] = await db.execute(
      `SELECT end_lat, end_lng FROM routes WHERE route_id = ? AND end_lat IS NOT NULL`,
      [trip.route_id]
    );
    
    if (routeCoords.length > 0 && routeCoords[0].end_lat) {
      destCoords = { 
        lat: parseFloat(routeCoords[0].end_lat), 
        lng: parseFloat(routeCoords[0].end_lng) 
      };
    } else {
      // Geocode on the fly and cache for next time
      destCoords = await googleMaps.geocodeAddress(trip.end_location);
      if (destCoords) {
        await db.execute(
          `UPDATE routes SET end_lat = ?, end_lng = ? WHERE route_id = ?`,
          [destCoords.lat, destCoords.lng, trip.route_id]
        );
      }
    }

    if (!destCoords) {
      return res.status(500).json({ error: 'Could not determine destination coordinates' });
    }

    // Get real-time traffic ETA
    const traffic = await googleMaps.getTrafficETA(
      parseFloat(trip.latitude), 
      parseFloat(trip.longitude),
      destCoords.lat, 
      destCoords.lng
    );

    // Log congestion for analytics
    await db.execute(
      `INSERT INTO congestion_logs (route_id, trip_id, congestion_level, reported_at, source)
       VALUES (?, ?, ?, NOW(), 'real_time')`,
      [trip.route_id, tripId, traffic.congestionLevel]
    );

    // Calculate estimated arrival time
    const estimatedArrival = new Date();
    estimatedArrival.setMinutes(estimatedArrival.getMinutes() + traffic.durationTrafficMinutes);

    res.json({
      success: true,
      tripId: parseInt(tripId),
      busNumber: trip.bus_number,
      routeName: trip.route_name,
      tripStatus: trip.status,
      currentLocation: {
        lat: parseFloat(trip.latitude),
        lng: parseFloat(trip.longitude),
        lastUpdated: trip.last_location_time
      },
      destination: trip.end_location,
      eta: {
        minutes: traffic.durationTrafficMinutes,
        estimatedArrival: estimatedArrival.toISOString(),
        comparedToNormal: traffic.delayMinutes,
        isDelayed: traffic.delayMinutes > 5
      },
      distanceRemainingKm: traffic.distanceKm,
      congestionLevel: traffic.congestionLevel,
      speed: {
        current: traffic.distanceKm / (traffic.durationTrafficMinutes / 60),
        averageNormal: traffic.distanceKm / (traffic.durationNormalMinutes / 60)
      }
    });
  } catch (error) {
    console.error('[Traffic] ETA error:', error);
    res.status(500).json({ error: 'Failed to calculate ETA', details: error.message });
  }
};

/**
 * Get congestion for a specific route
 * GET /api/traffic/route/:routeId/congestion
 */
exports.getRouteCongestion = async (req, res) => {
  const { routeId } = req.params;

  try {
    // Get route details
    const [routeRows] = await db.execute(
      `SELECT route_id, name, start_location, end_location, start_lat, start_lng, end_lat, end_lng
       FROM routes 
       WHERE route_id = ? AND is_active = 1`,
      [routeId]
    );

    if (routeRows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const route = routeRows[0];

    // Get coordinates (geocode if missing)
    let startCoords = route.start_lat && route.start_lng 
      ? { lat: parseFloat(route.start_lat), lng: parseFloat(route.start_lng) }
      : await googleMaps.geocodeAddress(route.start_location);
    
    let endCoords = route.end_lat && route.end_lng
      ? { lat: parseFloat(route.end_lat), lng: parseFloat(route.end_lng) }
      : await googleMaps.geocodeAddress(route.end_location);

    if (!startCoords || !endCoords) {
      return res.status(500).json({ error: 'Could not geocode route endpoints' });
    }

    // Cache coordinates if they were missing
    if (!route.start_lat) {
      await db.execute(
        `UPDATE routes SET start_lat = ?, start_lng = ? WHERE route_id = ?`,
        [startCoords.lat, startCoords.lng, routeId]
      );
    }
    if (!route.end_lat) {
      await db.execute(
        `UPDATE routes SET end_lat = ?, end_lng = ? WHERE route_id = ?`,
        [endCoords.lat, endCoords.lng, routeId]
      );
    }

    // Get traffic along the route
    const traffic = await googleMaps.getRouteTraffic(
      startCoords.lat, startCoords.lng,
      endCoords.lat, endCoords.lng
    );

    // Also get recent congestion from database (historical)
    const [recentCongestion] = await db.execute(
      `SELECT congestion_level, reported_at
       FROM congestion_logs
       WHERE route_id = ? AND reported_at > NOW() - INTERVAL 1 HOUR
       ORDER BY reported_at DESC
       LIMIT 10`,
      [routeId]
    );

    res.json({
      routeId: parseInt(routeId),
      routeName: route.name,
      startLocation: route.start_location,
      endLocation: route.end_location,
      currentTraffic: traffic,
      recentCongestion: recentCongestion.map(c => ({
        level: c.congestion_level,
        reportedAt: c.reported_at
      })),
      recommendation: this.getTravelRecommendation(traffic.congestionLevel, traffic.delayMinutes)
    });
  } catch (error) {
    console.error('[Traffic] Route congestion error:', error);
    res.status(500).json({ error: 'Failed to get route congestion' });
  }
};

/**
 * Get traffic recommendation helper
 */
function getTravelRecommendation(congestionLevel, delayMinutes) {
  switch (congestionLevel) {
    case 'high':
      return 'Heavy traffic expected. Consider alternative route or allow extra time.';
    case 'medium':
      return 'Moderate traffic. Expect some delays.';
    case 'low':
      return 'Light traffic. Good travel conditions.';
    default:
      return 'Clear traffic. Normal travel time expected.';
  }
}

exports.getTravelRecommendation = getTravelRecommendation;