const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// Controllers
const { 
  googleLogin, 
  verifySecretAndSignup, 
  getMe, 
  logout 
} = require('../controllers/auth.controller');

const {
  startTrip,
  reportLocation,
  reportPassengerCount,
  completeTrip,
  getLiveLocation,
  getETA,
} = require('../controllers/trip.controller');

const {
  getActiveTripByBusNumber,
  getAllBuses,
  createBus,
  updateBus,
} = require('../controllers/bus.controller');

const {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  getRouteCongestion,
} = require('../controllers/route.controller');

const {
  getDashboardStats,
  getPassengerAnalytics,
  reportCongestion,
} = require('../controllers/admin.controller');

const scheduleController = require('../controllers/schedule.controller');
const mapsController = require('../controllers/maps.controller');
const getMapsETA = mapsController.getETA;
const getDirections = mapsController.getDirections;
const geocode = mapsController.geocode;
const reverseGeocode = mapsController.reverseGeocode;

const router = express.Router();

// ========== AUTH ROUTES (public) ==========
router.post('/auth/google', googleLogin);
router.post('/auth/verify-secret', verifySecretAndSignup);
router.post('/auth/logout', authenticateToken, logout);
router.get('/auth/me', authenticateToken, getMe);

// ========== PASSENGER ROUTES (public - track by bus number) ==========
router.get('/buses/:busNumber/active-trip', getActiveTripByBusNumber);
router.get('/trips/:tripId/location', getLiveLocation);
router.get('/trips/:tripId/eta', getETA);

// Schedule routes (public)
router.get('/schedules/routes', scheduleController.getAllRoutesSimple);
router.get('/schedules/:routeId', scheduleController.getRouteSchedule);


// ========== DRIVER ROUTES (authenticated) ==========
router.post('/trips/:tripId/start', authenticateToken, startTrip);
router.post('/trips/:tripId/location', authenticateToken, reportLocation);
router.post('/trips/:tripId/passengers', authenticateToken, reportPassengerCount);
router.post('/trips/:tripId/complete', authenticateToken, completeTrip);

// ========== ADMIN ROUTES (authenticated + admin role) ==========
// Buses
router.get('/admin/buses', authenticateToken, requireRole(['admin']), getAllBuses);
router.post('/admin/buses', authenticateToken, requireRole(['admin']), createBus);
router.put('/admin/buses/:busId', authenticateToken, requireRole(['admin']), updateBus);

// Routes
router.get('/admin/routes', authenticateToken, requireRole(['admin']), getAllRoutes);
router.get('/admin/routes/:routeId', authenticateToken, requireRole(['admin']), getRouteById);
router.post('/admin/routes', authenticateToken, requireRole(['admin']), createRoute);
router.put('/admin/routes/:routeId', authenticateToken, requireRole(['admin']), updateRoute);
router.get('/admin/routes/:routeId/congestion', authenticateToken, requireRole(['admin']), getRouteCongestion);

// Dashboard & Analytics
router.get('/admin/dashboard/stats', authenticateToken, requireRole(['admin']), getDashboardStats);
router.get('/admin/analytics/passengers', authenticateToken, requireRole(['admin']), getPassengerAnalytics);
router.post('/admin/congestion/report', authenticateToken, requireRole(['admin']), reportCongestion);

// ========== MAPS ROUTES (public, but rate-limited) ==========
router.get('/maps/eta', getMapsETA);
router.get('/maps/directions', getDirections);
router.post('/maps/geocode', geocode);
router.post('/maps/reverse-geocode', reverseGeocode);


router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    dbHost: process.env.DB_HOST,
    apiUrl: process.env.VITE_API_URL || 'Not set (frontend build-time var)'
  });
});

// Also add a DB test endpoint
router.get('/health/db', async (req, res) => {
  try {
    const pool = require('../config/db');
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: error.message });
  }
});

//! ========== TEST ENDPOINTS (for development only - remove in production) ==========
if (process.env.NODE_ENV !== 'production') {
  const pool = require('../config/db');
  
  router.get('/test/buses', async (req, res) => {
    try {
      const [buses] = await pool.query('SELECT * FROM buses LIMIT 10');
      res.json({ success: true, count: buses.length, buses });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  router.get('/test/routes', async (req, res) => {
    try {
      const [routes] = await pool.query('SELECT * FROM routes LIMIT 10');
      res.json({ success: true, count: routes.length, routes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  router.get('/test/users', async (req, res) => {
    try {
      const [users] = await pool.query('SELECT user_id, email, full_name, role FROM users LIMIT 10');
      res.json({ success: true, count: users.length, users });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}

module.exports = router;