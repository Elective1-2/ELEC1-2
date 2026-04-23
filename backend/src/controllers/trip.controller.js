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

/**
 * GET /api/driver/routes/assigned
 * Get all routes assigned to the logged-in driver with their buses
 */
const getDriverAssignedRoutes = async (req, res) => {
  const driverId = req.user.userId;

  try {
    const [assignments] = await pool.query(
      `SELECT 
        r.route_id,
        r.name as route_name,
        r.start_location,
        r.end_location,
        r.base_duration_minutes,
        r.distance_km,
        b.bus_id,
        b.bus_number,
        b.plate_number,
        b.capacity,
        b.status as bus_status
       FROM bus_assignments ba
       JOIN routes r ON ba.route_id = r.route_id
       JOIN buses b ON ba.bus_id = b.bus_id
       WHERE ba.driver_id = ? 
         AND ba.is_active = 1 
         AND r.is_active = 1
         AND b.status = 'active'
       ORDER BY r.name, b.bus_number`,
      [driverId]
    );

    if (assignments.length === 0) {
      return res.json({
        success: true,
        routes: [],
        message: 'No routes assigned'
      });
    }

    // Group by route (since a driver can have multiple buses for the same route)
    const routesMap = new Map();
    
    assignments.forEach(row => {
      if (!routesMap.has(row.route_id)) {
        routesMap.set(row.route_id, {
          route_id: row.route_id,
          route_name: row.route_name,
          start_location: row.start_location,
          end_location: row.end_location,
          base_duration_minutes: row.base_duration_minutes,
          distance_km: row.distance_km,
          buses: []
        });
      }
      
      routesMap.get(row.route_id).buses.push({
        bus_id: row.bus_id,
        bus_number: row.bus_number,
        plate_number: row.plate_number,
        capacity: row.capacity,
        status: row.bus_status
      });
    });

    const routes = Array.from(routesMap.values());

    res.json({
      success: true,
      routes,
      total: routes.length
    });
  } catch (error) {
    console.error('Get driver assigned routes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/driver/routes/:routeId/departures
 * Get available departure times for a route (3 nearest including closest past)
 */
const getAvailableDepartures = async (req, res) => {
  const { routeId } = req.params;
  const driverId = req.user.userId;

  try {
    // Verify driver is assigned to this route
    const [assignment] = await pool.query(
      `SELECT assignment_id 
       FROM bus_assignments 
       WHERE driver_id = ? AND route_id = ? AND is_active = 1`,
      [driverId, routeId]
    );

    if (assignment.length === 0) {
      return res.status(403).json({ 
        error: 'You are not assigned to this route' 
      });
    }

    // Determine day type based on current day
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayType = isWeekend ? 'weekend' : 'weekday';
    
    // Get current time in HH:MM:SS format
    const currentTime = now.toTimeString().slice(0, 8);

    // Get schedules for this route (matching day_type OR 'daily')
    const [schedules] = await pool.query(
      `SELECT schedule_id, departure_time, direction, day_type
       FROM route_schedules
       WHERE route_id = ? 
         AND is_active = 1
         AND (day_type = ? OR day_type = 'daily')
       ORDER BY departure_time ASC`,
      [routeId, dayType]
    );

    if (schedules.length === 0) {
      return res.json({
        success: true,
        departures: [],
        current_time: currentTime,
        day_type: dayType,
        message: 'No departures scheduled for today'
      });
    }

    // Find the 3 nearest departure times (including closest past time)
    const departuresWithDiff = schedules.map(s => ({
      schedule_id: s.schedule_id,
      departure_time: s.departure_time,
      direction: s.direction,
      day_type: s.day_type,
      // Calculate absolute difference in minutes from current time
      timeDiff: Math.abs(
        (parseInt(s.departure_time.slice(0, 2)) * 60 + parseInt(s.departure_time.slice(3, 5))) -
        (parseInt(currentTime.slice(0, 2)) * 60 + parseInt(currentTime.slice(3, 5)))
      )
    }));

    // Sort by absolute time difference (closest times first)
    departuresWithDiff.sort((a, b) => a.timeDiff - b.timeDiff);

    // Take top 3 closest times
    const nearestDepartures = departuresWithDiff.slice(0, 3);
    
    // Sort them back by departure time for display
    nearestDepartures.sort((a, b) => a.departure_time.localeCompare(b.departure_time));

    res.json({
      success: true,
      departures: nearestDepartures.map(d => ({
        schedule_id: d.schedule_id,
        departure_time: d.departure_time.slice(0, 5), // HH:MM format
        direction: d.direction,
        day_type: d.day_type
      })),
      current_time: currentTime.slice(0, 5),
      day_type: dayType,
      total_available: schedules.length
    });
  } catch (error) {
    console.error('Get available departures error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/driver/trips/create
 * Create a new trip from selected schedule and bus
 */
const createTripFromSchedule = async (req, res) => {
  const { schedule_id, bus_id } = req.body;
  const driverId = req.user.userId;

  if (!schedule_id || !bus_id) {
    return res.status(400).json({ 
      error: 'schedule_id and bus_id are required' 
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verify schedule exists and get details
    const [schedules] = await connection.query(
      `SELECT rs.*, r.route_id, r.name as route_name
       FROM route_schedules rs
       JOIN routes r ON rs.route_id = r.route_id
       WHERE rs.schedule_id = ? AND rs.is_active = 1 AND r.is_active = 1`,
      [schedule_id]
    );

    if (schedules.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Schedule not found or inactive' });
    }

    const schedule = schedules[0];

    // Verify bus is assigned to this driver for this route
    const [assignments] = await connection.query(
      `SELECT assignment_id 
       FROM bus_assignments 
       WHERE driver_id = ? AND bus_id = ? AND route_id = ? AND is_active = 1`,
      [driverId, bus_id, schedule.route_id]
    );

    if (assignments.length === 0) {
      await connection.rollback();
      return res.status(403).json({ 
        error: 'You are not assigned to this bus for this route' 
      });
    }

    // Verify bus is active
    const [buses] = await connection.query(
      'SELECT bus_id, status FROM buses WHERE bus_id = ? AND status = "active"',
      [bus_id]
    );

    if (buses.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Bus is not active' });
    }

    // Create departure datetime for TODAY with the schedule time
    const today = new Date();
    const departureTime = schedule.departure_time;
    const scheduledDeparture = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(departureTime.slice(0, 2)),
      parseInt(departureTime.slice(3, 5)),
      0
    );

    // Check for duplicate trip (same bus, same scheduled departure time)
    const [existingTrips] = await connection.query(
      `SELECT trip_id, status 
       FROM trips 
       WHERE bus_id = ? 
         AND scheduled_departure = ?
         AND status IN ('scheduled', 'en_route', 'delayed')`,
      [bus_id, scheduledDeparture]
    );

    if (existingTrips.length > 0) {
      await connection.rollback();
      return res.status(409).json({ 
        error: 'A trip already exists for this bus at this departure time',
        existingTrip: {
          trip_id: existingTrips[0].trip_id,
          status: existingTrips[0].status
        }
      });
    }

    // Create the trip
    const [result] = await connection.query(
      `INSERT INTO trips 
       (bus_id, route_id, driver_id, scheduled_departure, status, created_at)
       VALUES (?, ?, ?, ?, 'scheduled', NOW())`,
      [bus_id, schedule.route_id, driverId, scheduledDeparture]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      trip_id: result.insertId,
      message: 'Trip created successfully',
      trip_details: {
        trip_id: result.insertId,
        bus_id,
        route_id: schedule.route_id,
        route_name: schedule.route_name,
        scheduled_departure: scheduledDeparture,
        status: 'scheduled'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create trip from schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
};

/**
 * GET /api/driver/trips/active
 * Get driver's currently active trip (en_route or scheduled for today)
 */
const getDriverActiveTrip = async (req, res) => {
  const driverId = req.user.userId;

  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [trips] = await pool.query(
      `SELECT 
        t.trip_id,
        t.status,
        t.scheduled_departure,
        t.actual_departure,
        b.bus_id,
        b.bus_number,
        b.plate_number,
        r.route_id,
        r.name as route_name,
        r.start_location,
        r.end_location,
        r.base_duration_minutes
       FROM trips t
       JOIN buses b ON t.bus_id = b.bus_id
       JOIN routes r ON t.route_id = r.route_id
       WHERE t.driver_id = ?
         AND t.status IN ('en_route', 'delayed', 'scheduled')
         AND DATE(t.scheduled_departure) = CURDATE()
       ORDER BY 
         FIELD(t.status, 'en_route', 'delayed', 'scheduled'),
         t.scheduled_departure ASC
       LIMIT 1`,
      [driverId]
    );

    if (trips.length === 0) {
      return res.json({
        success: true,
        hasActiveTrip: false
      });
    }

    const trip = trips[0];
    
    // Get latest location if trip is en_route
    let liveLocation = null;
    if (trip.status === 'en_route' || trip.status === 'delayed') {
      const [locations] = await pool.query(
        `SELECT latitude, longitude, speed, heading, reported_at
         FROM live_locations
         WHERE trip_id = ?
         ORDER BY reported_at DESC
         LIMIT 1`,
        [trip.trip_id]
      );
      
      if (locations.length > 0) {
        liveLocation = {
          latitude: parseFloat(locations[0].latitude),
          longitude: parseFloat(locations[0].longitude),
          speed: locations[0].speed,
          heading: locations[0].heading,
          reported_at: locations[0].reported_at
        };
      }
    }

    // Get passenger count
    const [passengerCount] = await pool.query(
      `SELECT passenger_count, is_overflow, recorded_at
       FROM passenger_counts
       WHERE trip_id = ?
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [trip.trip_id]
    );

    res.json({
      success: true,
      hasActiveTrip: true,
      trip: {
        trip_id: trip.trip_id,
        status: trip.status,
        scheduled_departure: trip.scheduled_departure,
        actual_departure: trip.actual_departure,
        bus: {
          bus_id: trip.bus_id,
          bus_number: trip.bus_number,
          plate_number: trip.plate_number
        },
        route: {
          route_id: trip.route_id,
          route_name: trip.route_name,
          start_location: trip.start_location,
          end_location: trip.end_location,
          base_duration_minutes: trip.base_duration_minutes
        },
        live_location: liveLocation,
        passenger_count: passengerCount.length > 0 ? {
          count: passengerCount[0].passenger_count,
          is_overflow: passengerCount[0].is_overflow === 1,
          recorded_at: passengerCount[0].recorded_at
        } : null
      }
    });
  } catch (error) {
    console.error('Get driver active trip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/driver/trips/:tripId/details
 * Get complete trip details for driver map page
 */
const getTripDetails = async (req, res) => {
  const { tripId } = req.params;
  const driverId = req.user.userId;

  try {
    // Verify driver owns this trip
    const [tripCheck] = await pool.query(
      'SELECT trip_id FROM trips WHERE trip_id = ? AND driver_id = ?',
      [tripId, driverId]
    );

    if (tripCheck.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view this trip' });
    }

    // Get comprehensive trip data
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
       LEFT JOIN passenger_counts pc ON t.trip_id = pc.trip_id
       LEFT JOIN live_locations ll ON t.trip_id = ll.trip_id
       WHERE t.trip_id = ?
       ORDER BY ll.reported_at DESC
       LIMIT 1`,
      [tripId]
    );

    // Get latest congestion level
    const [congestion] = await pool.query(
      `SELECT congestion_level
       FROM congestion_logs
       WHERE trip_id = ? OR route_id = (SELECT route_id FROM trips WHERE trip_id = ?)
       ORDER BY reported_at DESC
       LIMIT 1`,
      [tripId, tripId]
    );

    const trip = trips[0];
    
    res.json({
      success: true,
      trip: {
        trip_id: trip.trip_id,
        status: trip.status,
        scheduled_departure: trip.scheduled_departure,
        actual_departure: trip.actual_departure,
        driver: {
          name: trip.driver_name,
          phone: trip.driver_phone
        },
        bus: {
          bus_id: trip.bus_id,
          bus_number: trip.bus_number,
          plate_number: trip.plate_number,
          capacity: trip.capacity
        },
        route: {
          route_id: trip.route_id,
          name: trip.route_name,
          start_location: trip.start_location,
          end_location: trip.end_location,
          base_duration_minutes: trip.base_duration_minutes,
          distance_km: trip.distance_km
        },
        passenger_count: trip.passenger_count ? {
          count: trip.passenger_count,
          is_overflow: trip.is_overflow === 1,
          updated_at: trip.passenger_updated_at
        } : null,
        live_location: trip.latitude ? {
          latitude: parseFloat(trip.latitude),
          longitude: parseFloat(trip.longitude),
          speed: trip.speed ? parseFloat(trip.speed) : null,
          heading: trip.heading,
          updated_at: trip.location_updated_at
        } : null,
        congestion_level: congestion.length > 0 ? congestion[0].congestion_level : 'low'
      }
    });
  } catch (error) {
    console.error('Get trip details error:', error);
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
  getActiveTrips,
  getDriverAssignedRoutes,      
  getAvailableDepartures,       
  createTripFromSchedule,
  getDriverActiveTrip,
  getTripDetails
};