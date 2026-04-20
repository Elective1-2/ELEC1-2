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

module.exports = {
  startTrip,
  reportLocation,
  reportPassengerCount,
  completeTrip,
  getLiveLocation,
  getETA
};