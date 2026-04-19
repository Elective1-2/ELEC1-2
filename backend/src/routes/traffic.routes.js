const express = require('express');
const router = express.Router();
const trafficController = require('../controllers/traffic.controller');
const { verifyToken } = require('../middleware/auth');

// Public endpoints (or protected - your choice)
router.get('/trip/:tripId/eta', 
  verifyToken, 
  trafficController.getTripETA
);

router.get('/route/:routeId/congestion', 
  verifyToken, 
  trafficController.getRouteCongestion
);

module.exports = router;