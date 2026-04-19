const express = require('express');
const router = express.Router();
const geolocationController = require('../controllers/geolocation.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

// Driver endpoints (require authentication)
router.post('/update', 
  verifyToken, 
  requireRole(['driver', 'admin']), 
  geolocationController.updateDriverLocation
);

router.get('/trip/:tripId/latest', 
  verifyToken, 
  geolocationController.getLatestLocation
);

router.get('/trip/:tripId/history', 
  verifyToken, 
  geolocationController.getLocationHistory
);

module.exports = router;