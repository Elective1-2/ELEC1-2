const pool = require('../config/db');
const mapsService = require('../services/maps.service');

/**
 * GET /api/buses/:busNumber/active-trip
 * Get the currently active trip for a bus number
 * Used by passengers to track a bus
 */
async function getActiveTripByBusNumber(req, res) {
  const { busNumber } = req.params;

  try {
    // Find the bus
    const [buses] = await pool.query(
      'SELECT bus_id, bus_number, capacity FROM buses WHERE bus_number = ? AND status = "active"',
      [busNumber]
    );

    if (buses.length === 0) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    const bus = buses[0];

    // Find active trip for this bus
    const [trips] = await pool.query(
      `SELECT t.trip_id, t.scheduled_departure, t.status, t.actual_departure,
              r.name as route_name, r.start_location, r.end_location, r.base_duration_minutes,
              r.distance_km
       FROM trips t
       JOIN routes r ON t.route_id = r.route_id
       WHERE t.bus_id = ? AND t.status IN ('scheduled', 'en_route', 'delayed')
       ORDER BY t.scheduled_departure ASC
       LIMIT 1`,
      [bus.bus_id]
    );

    if (trips.length === 0) {
      return res.status(404).json({ 
        error: 'No active trip found for this bus',
        bus: { busNumber: bus.bus_number, capacity: bus.capacity }
      });
    }

    const trip = trips[0];

    // Get latest passenger count
    const [passengerCounts] = await pool.query(
      `SELECT passenger_count, is_overflow, recorded_at
       FROM passenger_counts
       WHERE trip_id = ?
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [trip.trip_id]
    );

    // Get latest location
    const [locations] = await pool.query(
      `SELECT latitude, longitude, speed, heading, reported_at
       FROM live_locations
       WHERE trip_id = ?
       ORDER BY reported_at DESC
       LIMIT 1`,
      [trip.trip_id]
    );

    // Get ETA from Google Maps if trip is en_route
    let eta = null;
    if (trip.status === 'en_route' && locations.length > 0) {
      try {
        const origin = `${locations[0].latitude},${locations[0].longitude}`;
        eta = await mapsService.getETAWithTraffic(origin, trip.end_location);
      } catch (error) {
        console.error('ETA fetch failed:', error.message);
        // Fallback to base duration
        eta = { etaMinutes: trip.base_duration_minutes };
      }
    } else if (trip.status === 'scheduled') {
      eta = { etaMinutes: trip.base_duration_minutes };
    }

    res.json({
      success: true,
      bus: {
        busId: bus.bus_id,
        busNumber: bus.bus_number,
        capacity: bus.capacity,
      },
      trip: {
        tripId: trip.trip_id,
        status: trip.status,
        scheduledDeparture: trip.scheduled_departure,
        actualDeparture: trip.actual_departure,
        routeName: trip.route_name,
        startLocation: trip.start_location,
        endLocation: trip.end_location,
      },
      passengerCount: passengerCounts.length > 0 ? {
        count: passengerCounts[0].passenger_count,
        isOverflow: passengerCounts[0].is_overflow === 1,
        recordedAt: passengerCounts[0].recorded_at,
      } : null,
      liveLocation: locations.length > 0 ? {
        latitude: parseFloat(locations[0].latitude),
        longitude: parseFloat(locations[0].longitude),
        speed: locations[0].speed,
        heading: locations[0].heading,
        reportedAt: locations[0].reported_at,
      } : null,
      eta: eta ? {
        minutes: eta.etaMinutes,
        text: eta.etaText,
      } : null,
    });
  } catch (error) {
    console.error('Get active trip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/buses
 * List all buses (admin)
 */
async function getAllBuses(req, res) {
  try {
    const [buses] = await pool.query(
      `SELECT b.*, 
        (SELECT COUNT(*) FROM trips WHERE bus_id = b.bus_id AND status = 'en_route') as active_trips
       FROM buses b
       ORDER BY b.bus_number`
    );
    res.json({ success: true, buses });
  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/buses
 * Create new bus (admin only)
 * Body: { bus_number, capacity, operator_id }
 */
async function createBus(req, res) {
  const { bus_number, capacity, operator_id } = req.body;

  if (!bus_number || !capacity) {
    return res.status(400).json({ error: 'bus_number and capacity are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO buses (bus_number, capacity, operator_id, status) VALUES (?, ?, ?, "active")',
      [bus_number, capacity, operator_id || null]
    );
    res.status(201).json({ success: true, busId: result.insertId });
  } catch (error) {
    console.error('Create bus error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Bus number already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * PUT /api/buses/:busId
 * Update bus (admin only)
 */
async function updateBus(req, res) {
  const { busId } = req.params;
  const { bus_number, capacity, status } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE buses SET bus_number = COALESCE(?, bus_number), capacity = COALESCE(?, capacity), status = COALESCE(?, status) WHERE bus_id = ?',
      [bus_number, capacity, status, busId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Update bus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getActiveTripByBusNumber,
  getAllBuses,
  createBus,
  updateBus,
};