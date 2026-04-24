const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// Controllers
const { 
  googleLogin, 
  verifySecretAndSignup, 
  getMe, 
  logout,
  initiateSignup,           
  verifyCodeAndSignup,      
  resendVerificationCode    
} = require('../controllers/auth.controller');

const {
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
} = require('../controllers/trip.controller');

const {
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

const {
  getAnalyticsSummary,
  getWeeklyRidership,
  getDelayHistory,
  getRoutePerformance,
  getTripHistory,
  getRoutesWithTrips
} = require('../controllers/analytics.controller');

const scheduleController = require('../controllers/schedule.controller');
const mapsController = require('../controllers/maps.controller');
const getMapsETA = mapsController.getETA;
const getDirections = mapsController.getDirections;
const geocode = mapsController.geocode;
const reverseGeocode = mapsController.reverseGeocode;

const router = express.Router();

router.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  next();
});

// ========== AUTH ROUTES (public) ==========
router.post('/auth/google', googleLogin);
router.post('/auth/verify-secret', verifySecretAndSignup);
router.post('/auth/logout', authenticateToken, logout);
router.get('/auth/me', authenticateToken, getMe);
router.post('/auth/signup/initiate', initiateSignup);        
router.post('/auth/signup/verify', verifyCodeAndSignup);     
router.post('/auth/signup/resend', resendVerificationCode);  

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

router.get('/driver/routes/assigned', authenticateToken, requireRole(['driver']), getDriverAssignedRoutes);
router.get('/driver/routes/:routeId/departures', authenticateToken, requireRole(['driver']), getAvailableDepartures);
router.post('/driver/trips/create', authenticateToken, requireRole(['driver']), createTripFromSchedule);
router.get('/driver/trips/active', authenticateToken, requireRole(['driver']), getDriverActiveTrip); 
router.get('/driver/trips/:tripId/details', authenticateToken, requireRole(['driver']), getTripDetails);

// ========== ADMIN ROUTES (authenticated + admin role) ==========
router.get('/admin/buses', authenticateToken, requireRole(['admin']), getAllBuses);
router.get('/admin/buses/:busId', authenticateToken, requireRole(['admin']), getBusById);
router.post('/admin/buses', authenticateToken, requireRole(['admin']), createBus);
router.put('/admin/buses/:busId', authenticateToken, requireRole(['admin']), updateBus);
router.delete('/admin/buses/:busId', authenticateToken, requireRole(['admin']), deleteBus);
router.post('/admin/buses/:busId/assignments', authenticateToken, requireRole(['admin']), addBusAssignment);

// Bus Assignments
router.post('/admin/buses/:busId/assign', authenticateToken, requireRole(['admin']), assignBusToDriverAndRoute);
router.delete('/admin/buses/:busId/assignments/:assignmentId', authenticateToken, requireRole(['admin']), removeBusAssignment);

// Drivers
router.get('/admin/drivers', authenticateToken, requireRole(['admin']), getAllDrivers);
router.get('/admin/drivers/:driverId', authenticateToken, requireRole(['admin']), getDriverById);
router.put('/admin/drivers/:driverId', authenticateToken, requireRole(['admin']), updateDriver);
router.delete('/admin/drivers/:driverId', authenticateToken, requireRole(['admin']), deleteDriver);
router.post('/admin/drivers/:driverId/assign', authenticateToken, requireRole(['admin']), assignDriverToBus);

// Individual Assignment Management (NEW ROUTES)
router.put('/admin/assignments/:assignmentId', authenticateToken, requireRole(['admin']), updateAssignment);
router.delete('/admin/assignments/:assignmentId', authenticateToken, requireRole(['admin']), deleteAssignment);
router.post('/admin/drivers/:driverId/assignments', authenticateToken, requireRole(['admin']), addDriverAssignment);

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
router.get('/admin/trips/active', authenticateToken, requireRole(['admin']), getActiveTrips);

// Analytics & Reporting
router.get('/admin/analytics/summary', authenticateToken, requireRole(['admin']), getAnalyticsSummary);
router.get('/admin/analytics/weekly-ridership', authenticateToken, requireRole(['admin']), getWeeklyRidership);
router.get('/admin/analytics/delay-history', authenticateToken, requireRole(['admin']), getDelayHistory);
router.get('/admin/analytics/route-performance', authenticateToken, requireRole(['admin']), getRoutePerformance);
router.get('/admin/analytics/trip-history', authenticateToken, requireRole(['admin']), getTripHistory);
router.get('/admin/analytics/routes-with-trips', authenticateToken, requireRole(['admin']), getRoutesWithTrips);

// ========== MAPS ROUTES (public, but rate-limited) ==========
router.get('/maps/eta', getMapsETA);
router.get('/maps/directions', getDirections);
router.post('/maps/geocode', geocode);
router.post('/maps/reverse-geocode', reverseGeocode);

router.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
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