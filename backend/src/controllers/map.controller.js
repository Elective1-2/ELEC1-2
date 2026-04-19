const db = require('../config/db');

/**
 * Haversine formula to calculate distance between two coordinates
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get nearby buses within a radius
 * GET /api/map/buses/nearby?lat=&lng=&radiusKm=
 */
exports.getNearbyBuses = async (req, res) => {
  let { lat, lng, radiusKm = 5 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  lat = parseFloat(lat);
  lng = parseFloat(lng);
  radiusKm = parseFloat(radiusKm);

  if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
    return res.status(400).json({ error: 'Invalid coordinates or radius' });
  }

  try {
    // Get latest location for all active trips
    const [rows] = await db.execute(
      `SELECT 
         ll.trip_id, 
         ll.latitude, 
         ll.longitude, 
         ll.speed,
         ll.reported_at,
         b.bus_id,
         b.bus_number,
         b.capacity,
         t.status,
         r.route_id,
         r.name as route_name,
         r.end_location,
         pc.passenger_count
       FROM live_locations ll
       JOIN trips t ON ll.trip_id = t.trip_id
       JOIN buses b ON t.bus_id = b.bus_id
       JOIN routes r ON t.route_id = r.route_id
       LEFT JOIN passenger_counts pc ON t.trip_id = pc.trip_id AND pc.recorded_at > NOW() - INTERVAL 1 HOUR
       WHERE t.status IN ('scheduled', 'en_route')
         AND ll.reported_at > NOW() - INTERVAL 5 MINUTE
       GROUP BY ll.trip_id
       ORDER BY ll.reported_at DESC`
    );

    // Calculate distance and filter
    const nearbyBuses = rows
      .map(bus => {
        const distance = haversineDistance(
          lat, lng,
          parseFloat(bus.latitude),
          parseFloat(bus.longitude)
        );
        const loadPercentage = bus.passenger_count ? (bus.passenger_count / bus.capacity) * 100 : 0;
        
        return {
          tripId: bus.trip_id,
          busId: bus.bus_id,
          busNumber: bus.bus_number,
          capacity: bus.capacity,
          currentPassengers: bus.passenger_count || 0,
          loadPercentage: Math.round(loadPercentage),
          loadStatus: loadPercentage >= 90 ? 'full' : (loadPercentage >= 70 ? 'crowded' : 'normal'),
          location: {
            lat: parseFloat(bus.latitude),
            lng: parseFloat(bus.longitude)
          },
          distanceKm: Math.round(distance * 10) / 10,
          speed: bus.speed ? parseFloat(bus.speed) : null,
          status: bus.status,
          routeName: bus.route_name,
          destination: bus.end_location,
          lastUpdated: bus.reported_at,
          isRecentlyUpdated: new Date(bus.reported_at) > new Date(Date.now() - 2 * 60 * 1000)
        };
      })
      .filter(bus => bus.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      userLocation: { lat, lng },
      searchRadiusKm: radiusKm,
      nearbyBuses,
      count: nearbyBuses.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Map] Nearby buses error:', error);
    res.status(500).json({ error: 'Failed to get nearby buses' });
  }
};

/**
 * Get traffic heatmap data (congestion zones)
 * GET /api/map/traffic/heatmap
 */
exports.getTrafficHeatmap = async (req, res) => {
  const { minutes = 60 } = req.query;

  try {
    // Get recent congestion logs with route details
    const [rows] = await db.execute(
      `SELECT 
         cl.congestion_id,
         cl.route_id,
         cl.congestion_level,
         cl.reported_at,
         r.name as route_name,
         r.start_location,
         r.end_location,
         r.start_lat,
         r.start_lng,
         r.end_lat,
         r.end_lng,
         r.distance_km
       FROM congestion_logs cl
       JOIN routes r ON cl.route_id = r.route_id
       WHERE cl.reported_at > NOW() - INTERVAL ? MINUTE
       ORDER BY cl.reported_at DESC`,
      [minutes]
    );

    // Get current active trips and their congestion
    const [activeTrips] = await db.execute(
      `SELECT 
         t.trip_id,
         t.route_id,
         t.status,
         ll.latitude,
         ll.longitude,
         r.name as route_name
       FROM trips t
       JOIN live_locations ll ON t.trip_id = ll.trip_id
       JOIN routes r ON t.route_id = r.route_id
       WHERE t.status IN ('en_route')
         AND ll.reported_at > NOW() - INTERVAL 5 MINUTE
       GROUP BY t.trip_id`
    );

    // Group by route for latest congestion
    const routeMap = new Map();
    for (const log of rows) {
      if (!routeMap.has(log.route_id) || 
          new Date(log.reported_at) > new Date(routeMap.get(log.route_id).reported_at)) {
        routeMap.set(log.route_id, log);
      }
    }

    const congestionZones = Array.from(routeMap.values()).map(zone => ({
      routeId: zone.route_id,
      routeName: zone.route_name,
      congestionLevel: zone.congestion_level,
      reportedAt: zone.reported_at,
      location: {
        start: zone.start_lat && zone.start_lng ? 
          { lat: parseFloat(zone.start_lat), lng: parseFloat(zone.start_lng) } : null,
        end: zone.end_lat && zone.end_lng ?
          { lat: parseFloat(zone.end_lat), lng: parseFloat(zone.end_lng) } : null
      },
      distanceKm: zone.distance_km ? parseFloat(zone.distance_km) : null
    }));

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      timeWindowMinutes: parseInt(minutes),
      congestionZones,
      activeBuses: activeTrips.length,
      activeTrips: activeTrips.map(trip => ({
        tripId: trip.trip_id,
        routeName: trip.route_name,
        status: trip.status,
        location: {
          lat: parseFloat(trip.latitude),
          lng: parseFloat(trip.longitude)
        }
      }))
    });
  } catch (error) {
    console.error('[Map] Heatmap error:', error);
    res.status(500).json({ error: 'Failed to get traffic heatmap' });
  }
};

/**
 * Get all active buses on map (for real-time tracking)
 * GET /api/map/buses/active
 */
exports.getActiveBuses = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
         ll.trip_id,
         ll.latitude,
         ll.longitude,
         ll.speed,
         ll.heading,
         ll.reported_at,
         b.bus_number,
         b.capacity,
         t.status,
         r.route_id,
         r.name as route_name,
         r.end_location,
         pc.passenger_count
       FROM live_locations ll
       JOIN trips t ON ll.trip_id = t.trip_id
       JOIN buses b ON t.bus_id = b.bus_id
       JOIN routes r ON t.route_id = r.route_id
       LEFT JOIN passenger_counts pc ON t.trip_id = pc.trip_id 
         AND pc.recorded_at > NOW() - INTERVAL 1 HOUR
       WHERE t.status IN ('en_route')
         AND ll.reported_at > NOW() - INTERVAL 5 MINUTE
       GROUP BY ll.trip_id
       ORDER BY ll.reported_at DESC`
    );

    const activeBuses = rows.map(bus => ({
      tripId: bus.trip_id,
      busNumber: bus.bus_number,
      location: {
        lat: parseFloat(bus.latitude),
        lng: parseFloat(bus.longitude)
      },
      speed: bus.speed ? parseFloat(bus.speed) : null,
      heading: bus.heading,
      capacity: bus.capacity,
      passengerCount: bus.passenger_count || 0,
      loadPercentage: bus.passenger_count ? Math.round((bus.passenger_count / bus.capacity) * 100) : 0,
      status: bus.status,
      routeName: bus.route_name,
      destination: bus.end_location,
      lastUpdated: bus.reported_at
    }));

    res.json({
      success: true,
      count: activeBuses.length,
      buses: activeBuses,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Map] Active buses error:', error);
    res.status(500).json({ error: 'Failed to get active buses' });
  }
};