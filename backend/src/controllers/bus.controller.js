const pool = require('../config/db');
const mapsService = require('../services/maps.service');

/**
 * GET /api/buses/:busNumber/active-trip
 * Get the currently active trip for a bus number
 */
async function getActiveTripByBusNumber(req, res) {
  const { busNumber } = req.params;

  try {
    const [buses] = await pool.query(
      'SELECT bus_id, bus_number, plate_number, capacity FROM buses WHERE bus_number = ? AND status = "active"',
      [busNumber]
    );

    if (buses.length === 0) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    const bus = buses[0];

    const [trips] = await pool.query(
      `SELECT t.trip_id, t.scheduled_departure, t.actual_departure, t.status,
              r.name as route_name, r.start_location, r.end_location, r.base_duration_minutes,
              r.distance_km, u.full_name as driver_name
       FROM trips t
       JOIN routes r ON t.route_id = r.route_id
       LEFT JOIN users u ON t.driver_id = u.user_id
       WHERE t.bus_id = ? AND t.status IN ('en_route', 'delayed', 'scheduled')
       ORDER BY FIELD(t.status, 'en_route', 'delayed', 'scheduled'), t.scheduled_departure ASC
       LIMIT 1`,
      [bus.bus_id]
    );

    if (trips.length === 0) {
      return res.status(404).json({ 
        error: 'No active trip found for this bus',
        bus: { busNumber: bus.bus_number, plateNumber: bus.plate_number, capacity: bus.capacity }
      });
    }

    const trip = trips[0];

    const [passengerCounts] = await pool.query(
      `SELECT passenger_count, is_overflow, recorded_at
       FROM passenger_counts
       WHERE trip_id = ?
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [trip.trip_id]
    );

    const [locations] = await pool.query(
      `SELECT latitude, longitude, speed, heading, reported_at
       FROM live_locations
       WHERE trip_id = ?
       ORDER BY reported_at DESC
       LIMIT 1`,
      [trip.trip_id]
    );

    let eta = null;
    if (trip.status === 'en_route' && locations.length > 0) {
      try {
        const origin = `${locations[0].latitude},${locations[0].longitude}`;
        const etaData = await mapsService.getETAWithTraffic(origin, trip.end_location);
        eta = {
          minutes: etaData.etaMinutes,
          text: etaData.etaText,
        };
      } catch (error) {
        console.error('ETA fetch failed:', error.message);
        eta = { minutes: trip.base_duration_minutes, text: `${trip.base_duration_minutes} mins` };
      }
    } else if (trip.status === 'scheduled') {
      eta = { minutes: trip.base_duration_minutes, text: `${trip.base_duration_minutes} mins` };
    }

    res.json({
      success: true,
      bus: {
        busId: bus.bus_id,
        busNumber: bus.bus_number,
        plateNumber: bus.plate_number,
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
      driver: {
        name: trip.driver_name || 'Not assigned',
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
      eta: eta,
    });
  } catch (error) {
    console.error('Get active trip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/admin/buses
 * List all buses with ALL their current assignments (driver + route)
 */
async function getAllBuses(req, res) {
  try {
    // First, get all non-retired buses
    const [buses] = await pool.query(
      `SELECT 
        b.bus_id,
        b.bus_number,
        b.plate_number,
        b.capacity,
        b.status,
        b.last_maintenance_date,
        b.created_at
       FROM buses b
       WHERE b.status != 'retired'
       ORDER BY b.bus_number`
    );
    
    // Then, get all active assignments for these buses
    const [assignments] = await pool.query(
      `SELECT 
        ba.assignment_id,
        ba.bus_id,
        ba.driver_id,
        ba.route_id,
        ba.assigned_date,
        ba.is_active,
        u.full_name as driver_name,
        u.email as driver_email,
        u.phone as driver_phone,
        r.name as route_name,
        r.start_location,
        r.end_location,
        r.distance_km,
        r.base_duration_minutes
       FROM bus_assignments ba
       LEFT JOIN users u ON ba.driver_id = u.user_id
       LEFT JOIN routes r ON ba.route_id = r.route_id
       WHERE ba.is_active = 1
       ORDER BY ba.bus_id, ba.assigned_date DESC`
    );
    
    // Group assignments by bus
    const busMap = new Map();
    
    // Initialize map with all buses (even those without assignments)
    buses.forEach(bus => {
      busMap.set(bus.bus_id, {
        bus_id: bus.bus_id,
        bus_number: bus.bus_number,
        plate_number: bus.plate_number,
        capacity: bus.capacity,
        status: bus.status,
        last_maintenance_date: bus.last_maintenance_date,
        created_at: bus.created_at,
        assignments: [] // Empty array for buses with no assignments
      });
    });
    
    // Add assignments to their respective buses
    assignments.forEach(assignment => {
      const bus = busMap.get(assignment.bus_id);
      if (bus) {
        bus.assignments.push({
          assignment_id: assignment.assignment_id,
          driver_id: assignment.driver_id,
          driver_name: assignment.driver_name,
          driver_email: assignment.driver_email,
          driver_phone: assignment.driver_phone,
          route_id: assignment.route_id,
          route_name: assignment.route_name,
          start_location: assignment.start_location,
          end_location: assignment.end_location,
          distance_km: assignment.distance_km,
          base_duration_minutes: assignment.base_duration_minutes,
          assigned_date: assignment.assigned_date,
          is_active: assignment.is_active
        });
      }
    });
    
    // Convert map to array
    const busesList = Array.from(busMap.values());
    
    res.json({ 
      success: true, 
      buses: busesList,
      total: busesList.length
    });
  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
/**
 * GET /api/admin/buses/:busId
 * Get single bus with its assignments
 */
async function getBusById(req, res) {
  const { busId } = req.params;

  try {
    const [buses] = await pool.query(
      `SELECT 
        b.bus_id,
        b.bus_number,
        b.plate_number,
        b.capacity,
        b.status,
        ba.assignment_id,
        u.user_id as driver_id,
        u.full_name as driver_name,
        r.route_id,
        r.name as route_name
       FROM buses b
       LEFT JOIN bus_assignments ba ON b.bus_id = ba.bus_id AND ba.is_active = 1
       LEFT JOIN users u ON ba.driver_id = u.user_id
       LEFT JOIN routes r ON ba.route_id = r.route_id
       WHERE b.bus_id = ?`,
      [busId]
    );

    if (buses.length === 0) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    const bus = {
      bus_id: buses[0].bus_id,
      bus_number: buses[0].bus_number,
      plate_number: buses[0].plate_number,
      capacity: buses[0].capacity,
      status: buses[0].status,
      assignments: []
    };

    buses.forEach(row => {
      if (row.driver_id && row.route_id) {
        bus.assignments.push({
          assignment_id: row.assignment_id,
          driver_id: row.driver_id,
          driver_name: row.driver_name,
          route_id: row.route_id,
          route_name: row.route_name
        });
      }
    });

    res.json({ success: true, bus });
  } catch (error) {
    console.error('Get bus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/admin/buses
 * Create new bus
 */
async function createBus(req, res) {
  const { bus_number, plate_number, capacity } = req.body;

  if (!bus_number || !capacity) {
    return res.status(400).json({ error: 'bus_number and capacity are required' });
  }

  try {
    // Handle empty plate_number - set to NULL instead of empty string
    // This allows multiple buses to have no plate number without violating UNIQUE constraint
    const plateNumberValue = plate_number && plate_number.trim() !== '' ? plate_number.trim() : null;
    
    const [result] = await pool.query(
      'INSERT INTO buses (bus_number, plate_number, capacity, status) VALUES (?, ?, ?, "active")',
      [bus_number, plateNumberValue, capacity]
    );

    res.status(201).json({ 
      success: true, 
      busId: result.insertId,
      message: 'Bus created successfully' 
    });
  } catch (error) {
    console.error('Create bus error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('bus_number')) {
        return res.status(409).json({ error: 'Bus number already exists' });
      } else if (error.message.includes('plate_number')) {
        return res.status(409).json({ error: 'Plate number already exists' });
      }
      return res.status(409).json({ error: 'Duplicate entry' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * PUT /api/admin/buses/:busId
 * Update bus details
 */
async function updateBus(req, res) {
  const { busId } = req.params;
  const { bus_number, plate_number, capacity, status } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE buses 
       SET bus_number = COALESCE(?, bus_number),
           plate_number = COALESCE(?, plate_number),
           capacity = COALESCE(?, capacity),
           status = COALESCE(?, status)
       WHERE bus_id = ?`,
      [bus_number, plate_number, capacity, status, busId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Update bus error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Bus number already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * DELETE /api/admin/buses/:busId
 * Soft delete bus (set status to 'retired')
 */
async function deleteBus(req, res) {
  const { busId } = req.params;

  try {
    // First, deactivate any active assignments
    await pool.query(
      'UPDATE bus_assignments SET is_active = 0 WHERE bus_id = ?',
      [busId]
    );
    
    const [result] = await pool.query(
      'UPDATE buses SET status = "retired" WHERE bus_id = ?',
      [busId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete bus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/admin/buses/:busId/assign
 * Assign a driver and route to a bus
 * Body: { driver_id, route_id }
 */
async function assignBusToDriverAndRoute(req, res) {
  const { busId } = req.params;
  const { driver_id, route_id } = req.body;

  if (!driver_id || !route_id) {
    return res.status(400).json({ error: 'driver_id and route_id are required' });
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Deactivate current active assignment for this bus (if any)
    await connection.query(
      'UPDATE bus_assignments SET is_active = 0 WHERE bus_id = ? AND is_active = 1',
      [busId]
    );
    
    // Create new assignment
    const [result] = await connection.query(
      `INSERT INTO bus_assignments (bus_id, driver_id, route_id, assigned_date, is_active)
       VALUES (?, ?, ?, CURDATE(), 1)`,
      [busId, driver_id, route_id]
    );
    
    await connection.commit();
    res.status(201).json({ success: true, assignmentId: result.insertId });
  } catch (error) {
    await connection.rollback();
    console.error('Assign bus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

/**
 * DELETE /api/admin/buses/:busId/assignments/:assignmentId
 * Remove a bus assignment
 */
async function removeBusAssignment(req, res) {
  const { busId, assignmentId } = req.params;

  try {
    const [result] = await pool.query(
      'UPDATE bus_assignments SET is_active = 0 WHERE assignment_id = ? AND bus_id = ?',
      [assignmentId, busId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Remove assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/admin/drivers
 * List all drivers with their current assignments
 */
async function getAllDrivers(req, res) {
  try {
    // First, get all drivers
    const [drivers] = await pool.query(
      `SELECT 
        u.user_id,
        u.email,
        u.full_name,
        u.phone,
        u.is_active,
        u.created_at
       FROM users u
       WHERE u.role = 'driver'
       ORDER BY u.full_name`
    );
    
    // Then, get all active assignments for these drivers
    const [assignments] = await pool.query(
      `SELECT 
        ba.assignment_id,
        ba.driver_id,
        ba.bus_id,
        ba.route_id,
        ba.assigned_date,
        ba.is_active,
        b.bus_number,
        b.plate_number,
        b.capacity,
        b.status as bus_status,
        r.name as route_name,
        r.start_location,
        r.end_location
       FROM bus_assignments ba
       LEFT JOIN buses b ON ba.bus_id = b.bus_id
       LEFT JOIN routes r ON ba.route_id = r.route_id
       WHERE ba.is_active = 1
       ORDER BY ba.driver_id, ba.assigned_date DESC`
    );
    
    // Group assignments by driver
    const driverMap = new Map();
    
    // Initialize map with all drivers (even those without assignments)
    drivers.forEach(driver => {
      driverMap.set(driver.user_id, {
        user_id: driver.user_id,
        email: driver.email,
        full_name: driver.full_name,
        phone: driver.phone,
        is_active: driver.is_active,
        created_at: driver.created_at,
        assignments: [] // Empty array for drivers with no assignments
      });
    });
    
    // Add assignments to their respective drivers
    assignments.forEach(assignment => {
      const driver = driverMap.get(assignment.driver_id);
      if (driver) {
        driver.assignments.push({
          assignment_id: assignment.assignment_id,
          bus_id: assignment.bus_id,
          bus_number: assignment.bus_number,
          plate_number: assignment.plate_number,
          capacity: assignment.capacity,
          bus_status: assignment.bus_status,
          route_id: assignment.route_id,
          route_name: assignment.route_name,
          start_location: assignment.start_location,
          end_location: assignment.end_location,
          assigned_date: assignment.assigned_date,
          is_active: assignment.is_active
        });
      }
    });
    
    // Convert map to array
    const driversList = Array.from(driverMap.values());
    
    res.json({ 
      success: true, 
      drivers: driversList,
      total: driversList.length
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * PUT /api/admin/assignments/:assignmentId
 * Update an existing assignment
 */
async function updateAssignment(req, res) {
  const { assignmentId } = req.params;
  const { bus_id, route_id } = req.body;

  if (!bus_id || !route_id) {
    return res.status(400).json({ error: 'bus_id and route_id are required' });
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Check if assignment exists
    const [existing] = await connection.query(
      'SELECT * FROM bus_assignments WHERE assignment_id = ?',
      [assignmentId]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    // Update the assignment
    const [result] = await connection.query(
      `UPDATE bus_assignments 
       SET bus_id = ?, route_id = ?, updated_at = NOW()
       WHERE assignment_id = ?`,
      [bus_id, route_id, assignmentId]
    );
    
    await connection.commit();
    res.json({ success: true, message: 'Assignment updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

/**
 * DELETE /api/admin/assignments/:assignmentId
 * Delete/Deactivate a specific assignment
 */
async function deleteAssignment(req, res) {
  const { assignmentId } = req.params;

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Soft delete - set is_active to 0
    const [result] = await connection.query(
      'UPDATE bus_assignments SET is_active = 0, updated_at = NOW() WHERE assignment_id = ?',
      [assignmentId]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    await connection.commit();
    res.json({ success: true, message: 'Assignment removed successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

/**
 * POST /api/admin/drivers/:driverId/assignments
 * Add a new assignment for a driver (without affecting existing ones)
 */
async function addDriverAssignment(req, res) {
  const { driverId } = req.params;
  const { bus_id, route_id } = req.body;

  if (!bus_id || !route_id) {
    return res.status(400).json({ error: 'bus_id and route_id are required' });
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Check if driver exists and is active
    const [driver] = await connection.query(
      'SELECT user_id FROM users WHERE user_id = ? AND role = "driver" AND is_active = 1',
      [driverId]
    );
    
    if (driver.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Active driver not found' });
    }
    
    // Check if bus exists and is active
    const [bus] = await connection.query(
      'SELECT bus_id FROM buses WHERE bus_id = ? AND status = "active"',
      [bus_id]
    );
    
    if (bus.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Active bus not found' });
    }
    
    // Check if this exact assignment already exists and is active
    const [existing] = await connection.query(
      `SELECT assignment_id FROM bus_assignments 
       WHERE driver_id = ? AND bus_id = ? AND route_id = ? AND is_active = 1`,
      [driverId, bus_id, route_id]
    );
    
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: 'This exact assignment already exists' });
    }
    
    // Create new assignment (keeping existing ones active)
    const [result] = await connection.query(
      `INSERT INTO bus_assignments (bus_id, driver_id, route_id, assigned_date, is_active)
       VALUES (?, ?, ?, CURDATE(), 1)`,
      [bus_id, driverId, route_id]
    );
    
    await connection.commit();
    res.status(201).json({ 
      success: true, 
      assignmentId: result.insertId,
      message: 'Assignment added successfully' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Add driver assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

/**
 * GET /api/admin/drivers/:driverId
 * Get single driver details
 */
async function getDriverById(req, res) {
  const { driverId } = req.params;

  try {
    const [drivers] = await pool.query(
      `SELECT user_id, email, full_name, phone, is_active, role, created_at
       FROM users 
       WHERE user_id = ? AND role = 'driver'`,
      [driverId]
    );

    if (drivers.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Get current assignment
    const [assignments] = await pool.query(
      `SELECT ba.assignment_id, ba.bus_id, b.bus_number, b.plate_number, 
              ba.route_id, r.name as route_name, ba.assigned_date
       FROM bus_assignments ba
       LEFT JOIN buses b ON ba.bus_id = b.bus_id
       LEFT JOIN routes r ON ba.route_id = r.route_id
       WHERE ba.driver_id = ? AND ba.is_active = 1
       LIMIT 1`,
      [driverId]
    );

    res.json({
      success: true,
      driver: {
        ...drivers[0],
        currentAssignment: assignments[0] || null
      }
    });
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * PUT /api/admin/drivers/:driverId
 * Update driver details
 */
async function updateDriver(req, res) {
  const { driverId } = req.params;
  const { phone, is_active } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE users 
       SET phone = COALESCE(?, phone),
           is_active = COALESCE(?, is_active)
       WHERE user_id = ? AND role = 'driver'`,
      [phone, is_active, driverId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * DELETE /api/admin/drivers/:driverId
 * Soft delete driver (set is_active = 0)
 */
async function deleteDriver(req, res) {
  const { driverId } = req.params;

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Deactivate any active assignments
    await connection.query(
      'UPDATE bus_assignments SET is_active = 0 WHERE driver_id = ?',
      [driverId]
    );
    
    // Soft delete driver
    const [result] = await connection.query(
      'UPDATE users SET is_active = 0 WHERE user_id = ? AND role = "driver"',
      [driverId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error('Delete driver error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

/**
 * POST /api/admin/drivers/:driverId/assign
 * Assign driver to a bus and route
 */
async function assignDriverToBus(req, res) {
  const { driverId } = req.params;
  const { bus_id, route_id } = req.body;

  if (!bus_id || !route_id) {
    return res.status(400).json({ error: 'bus_id and route_id are required' });
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Check if driver exists and is active
    const [driver] = await connection.query(
      'SELECT user_id FROM users WHERE user_id = ? AND role = "driver" AND is_active = 1',
      [driverId]
    );
    
    if (driver.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Active driver not found' });
    }
    
    // Check if bus exists and is active
    const [bus] = await connection.query(
      'SELECT bus_id FROM buses WHERE bus_id = ? AND status = "active"',
      [bus_id]
    );
    
    if (bus.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Active bus not found' });
    }
    
    // Deactivate current active assignment for this driver
    await connection.query(
      'UPDATE bus_assignments SET is_active = 0 WHERE driver_id = ? AND is_active = 1',
      [driverId]
    );
    
    // Create new assignment
    const [result] = await connection.query(
      `INSERT INTO bus_assignments (bus_id, driver_id, route_id, assigned_date, is_active)
       VALUES (?, ?, ?, CURDATE(), 1)`,
      [bus_id, driverId, route_id]
    );
    
    await connection.commit();
    res.status(201).json({ success: true, assignmentId: result.insertId });
  } catch (error) {
    await connection.rollback();
    console.error('Assign driver error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

/**
 * POST /api/admin/buses/:busId/assignments
 * Add a new assignment for a bus (without affecting existing ones)
 */
async function addBusAssignment(req, res) {
  const { busId } = req.params;
  const { driver_id, route_id } = req.body;

  if (!driver_id || !route_id) {
    return res.status(400).json({ error: 'driver_id and route_id are required' });
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Check if bus exists and is active
    const [bus] = await connection.query(
      'SELECT bus_id FROM buses WHERE bus_id = ? AND status = "active"',
      [busId]
    );
    
    if (bus.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Active bus not found' });
    }
    
    // Check if driver exists and is active
    const [driver] = await connection.query(
      'SELECT user_id FROM users WHERE user_id = ? AND role = "driver" AND is_active = 1',
      [driver_id]
    );
    
    if (driver.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Active driver not found' });
    }
    
    // Check if this exact assignment already exists and is active
    const [existing] = await connection.query(
      `SELECT assignment_id FROM bus_assignments 
       WHERE bus_id = ? AND driver_id = ? AND route_id = ? AND is_active = 1`,
      [busId, driver_id, route_id]
    );
    
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: 'This exact assignment already exists' });
    }
    
    // Create new assignment (keeping existing ones active)
    const [result] = await connection.query(
      `INSERT INTO bus_assignments (bus_id, driver_id, route_id, assigned_date, is_active)
       VALUES (?, ?, ?, CURDATE(), 1)`,
      [busId, driver_id, route_id]
    );
    
    await connection.commit();
    res.status(201).json({ 
      success: true, 
      assignmentId: result.insertId,
      message: 'Assignment added successfully' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Add bus assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

module.exports = {
  getActiveTripByBusNumber,
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  assignBusToDriverAndRoute,
  removeBusAssignment,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  assignDriverToBus,
  updateAssignment,
  deleteAssignment,
  addDriverAssignment,
  addBusAssignment,
};