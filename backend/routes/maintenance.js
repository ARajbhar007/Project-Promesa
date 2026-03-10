const express = require('express');
const router = express.Router();
const { getMaintenanceRecords, addMaintenanceRecord, updateMaintenanceRecord } = require('../controllers/maintenanceController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getMaintenanceRecords).post(protect, addMaintenanceRecord);
router.route('/:id').put(protect, updateMaintenanceRecord);

module.exports = router;
