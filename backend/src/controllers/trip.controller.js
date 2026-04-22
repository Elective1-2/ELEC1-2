const pool = require('../config/db');

// Driver: Start trip
const startTrip = async (req, res) => {
  const { tripId } = req.params;
  const driverId = req.user.userId;

  try {
    const [result] = await pool.query(
      `UPDATE trips
       SET status = 'en_route', actual_departure = NOW()
       WHERE trip_id = ? AND driver_id = ? AND status = 'scheduled'`,
      [tripId, driverId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Trip not found or already started' });
    }

    res.json({ message: 'Trip started successfully' });
  } catch (error) {
    console.error('Start trip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Driver: Report live location
const reportLocation = async (req, res) => {
  const { tripId } = req.params;
  const { latitude, longitude, speed, heading, accuracy_m } = req.body;
  const driverId = req.user.userId;

  try {
    const [tripCheck] = await pool.query(
      'SELECT trip_id FROM trips WHERE trip_id = ? AND driver_id = ? AND status = "en_route"',
      [tripId, driverId]
    );

    if (tripCheck.length === 0) {
      return res.status(403).json({ error: 'Not authorized or trip not active' });
    }

    await pool.query(
      `INSERT INTO live_locations (trip_id, latitude, longitude, speed, heading, accuracy_m)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tripId, latitude, longitude, speed || null, heading || null, accuracy_m || null]
    );

    res.status(201).json({ message: 'Location recorded' });
  } catch (error) {
    console.error('Report location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Driver: Report passenger count
const reportPassengerCount = async (req, res) => {
  const { tripId } = req.params;
  const { passenger_count, is_overflow } = req.body;
  const driverId = req.user.userId;

  try {
    const [tripCheck] = await pool.query(
      'SELECT trip_id FROM trips WHERE trip_id = ? AND driver_id = ?',
      [tripId, driverId]
    );

    if (tripCheck.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const [existing] = await pool.query(
      'SELECT count_id FROM passenger_counts WHERE trip_id = ?',
      [tripId]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE passenger_counts
         SET passenger_count = ?, is_overflow = ?, recorded_at = NOW()
         WHERE trip_id = ?`,
        [passenger_count, is_overflow || 0, tripId]
      );
    } else {
      await pool.query(
        `INSERT INTO passenger_counts (trip_id, recorded_by, passenger_count, is_overflow)
         VALUES (?, ?, ?, ?)`,
        [tripId, driverId, passenger_count, is_overflow || 0]
      );
    }

    res.json({ message: 'Passenger count recorded' });
  } catch (error) {
    console.error('Passenger count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Driver: Complete trip
const completeTrip = async (req, res) => {
  const { tripId } = req.params;
  const driverId = req.user.userId;

  try {
    const [result] = await pool.query(
      `UPDATE trips
       SET status = 'completed', actual_arrival = NOW()
       WHERE trip_id = ? AND driver_id = ? AND status = 'en_route'`,
      [tripId, driverId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Active trip not found' });
    }

    res.json({ message: 'Trip completed' });
  } catch (error) {
    console.error('Complete trip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Passenger: Get live location
const getLiveLocation = async (req, res) => {
  const { tripId } = req.params;

  try {
    const [locations] = await pool.query(
      `SELECT ll.latitude, ll.longitude, ll.speed, ll.heading, ll.reported_at,
              t.status, b.bus_number, r.name as route_name
       FROM live_locations ll
       JOIN trips t ON ll.trip_id = t.trip_id
       JOIN buses b ON t.bus_id = b.bus_id
       JOIN routes r ON t.route_id = r.route_id
       WHERE ll.trip_id = ?
       ORDER BY ll.reported_at DESC
       LIMIT 1`,
      [tripId]
    );

    if (locations.length === 0) {
      return res.status(404).json({ error: 'No live location available' });
    }

    res.json(locations[0]);
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Passenger: Get ETA
const getETA = async (req, res) => {
  const { tripId } = req.params;

  try {
    const [tripData] = await pool.query(
      `SELECT t.scheduled_departure, t.status, r.base_duration_minutes,
              r.distance_km, r.start_location, r.end_location
       FROM trips t
       JOIN routes r ON t.route_id = r.route_id
       WHERE t.trip_id = ?`,
      [tripId]
    );

    if (tripData.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const trip = tripData[0];
    let etaMinutes = trip.base_duration_minutes;

    const [congestion] = await pool.query(
      `SELECT congestion_level
       FROM congestion_logs
       WHERE route_id = (SELECT route_id FROM trips WHERE trip_id = ?)
       ORDER BY reported_at DESC
       LIMIT 1`,
      [tripId]
    );

    if (congestion.length > 0) {
      const multipliers = { low: 1.0, medium: 1.3, high: 1.6, full: 2.0 };
      etaMinutes = Math.round(etaMinutes * (multipliers[congestion[0].congestion_level] || 1.0));
    }

    let estimatedArrival = null;
    if (trip.status === 'en_route') {
      estimatedArrival = new Date(Date.now() + etaMinutes * 60000);
    } else if (trip.status === 'scheduled') {
      estimatedArrival = new Date(trip.scheduled_departure);
    }

    res.json({
      tripId,
      status: trip.status,
      eta_minutes: etaMinutes,
      estimated_arrival: estimatedArrival,
      from: trip.start_location,
      to: trip.end_location
    });
  } catch (error) {
    console.error('ETA error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/admin/trips/active
 * Get all active trips (en_route status) for admin tracking
 */
const getActiveTrips = async (req, res) => {
  try {
    const [trips] = await pool.query(
      `SELECT 
        t.trip_id,
        t.scheduled_departure,
        t.actual_departure,
        t.status,
        b.bus_id,
        b.bus_number,
        b.plate_number,
        b.capacity,
        u.user_id as driver_id,
        u.full_name as driver_name,
        u.phone as driver_phone,
        r.route_id,
        r.name as route_name,
        r.start_location,
        r.end_location,
        r.base_duration_minutes,
        r.distance_km,
        pc.passenger_count,
        pc.is_overflow,
        pc.recorded_at as passenger_updated_at,
        ll.latitude,
        ll.longitude,
        ll.speed,
        ll.heading,
        ll.reported_at as location_updated_at
       FROM trips t
       JOIN buses b ON t.bus_id = b.bus_id
       JOIN users u ON t.driver_id = u.user_id
       JOIN routes r ON t.route_id = r.route_id
       LEFT JOIN (
         SELECT pc1.trip_id, pc1.passenger_count, pc1.is_overflow, pc1.recorded_at
         FROM passenger_counts pc1
         INNER JOIN (
           SELECT trip_id, MAX(recorded_at) as max_recorded
           FROM passenger_counts
           GROUP BY trip_id
         ) pc2 ON pc1.trip_id = pc2.trip_id AND pc1.recorded_at = pc2.max_recorded
       ) pc ON t.trip_id = pc.trip_id
       LEFT JOIN (
         SELECT ll1.trip_id, ll1.latitude, ll1.longitude, ll1.speed, ll1.heading, ll1.reported_at
         FROM live_locations ll1
         INNER JOIN (
           SELECT trip_id, MAX(reported_at) as max_reported
           FROM live_locations
           GROUP BY trip_id
         ) ll2 ON ll1.trip_id = ll2.trip_id AND ll1.reported_at = ll2.max_reported
       ) ll ON t.trip_id = ll.trip_id
       WHERE t.status = 'en_route'
       ORDER BY t.actual_departure DESC, t.scheduled_departure DESC`
    );

    const activeTrips = trips.map(trip => ({
      trip_id: trip.trip_id,
      bus_id: trip.bus_id,
      bus_number: trip.bus_number,
      plate_number: trip.plate_number,
      capacity: trip.capacity,
      driver_id: trip.driver_id,
      driver_name: trip.driver_name,
      driver_phone: trip.driver_phone,
      route_id: trip.route_id,
      route_name: trip.route_name,
      start_location: trip.start_location,
      end_location: trip.end_location,
      base_duration_minutes: trip.base_duration_minutes,
      distance_km: trip.distance_km,
      scheduled_departure: trip.scheduled_departure,
      actual_departure: trip.actual_departure,
      status: trip.status,
      passenger_count: trip.passenger_count,
      is_overflow: trip.is_overflow === 1,
      passenger_updated_at: trip.passenger_updated_at,
      latitude: trip.latitude ? parseFloat(trip.latitude) : null,
      longitude: trip.longitude ? parseFloat(trip.longitude) : null,
      speed: trip.speed ? parseFloat(trip.speed) : null,
      heading: trip.heading,
      location_updated_at: trip.location_updated_at
    }));

    res.json({
      success: true,
      trips: activeTrips,
      total: activeTrips.length
    });
  } catch (error) {
    console.error('Get active trips error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  startTrip,
  reportLocation,
  reportPassengerCount,
  completeTrip,
  getLiveLocation,
  getETA,
  getActiveTrips
};