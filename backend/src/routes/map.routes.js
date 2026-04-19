const express = require('express');
const router = express.Router();
const mapController = require('../controllers/map.controller');
const { verifyToken } = require('../middleware/auth');

// These can be public or protected
router.get('/buses/nearby', 
  verifyToken, 
  mapController.getNearbyBuses
);

router.get('/buses/active', 
  verifyToken, 
  mapController.getActiveBuses
);

router.get('/traffic/heatmap', 
  verifyToken, 
  mapController.getTrafficHeatmap
);

module.exports = router;