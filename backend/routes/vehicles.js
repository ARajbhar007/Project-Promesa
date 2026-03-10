const express = require('express');
const router = express.Router();
const { getVehicles, addVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getVehicles).post(protect, addVehicle);
router.route('/:id').put(protect, updateVehicle).delete(protect, deleteVehicle);

module.exports = router;
