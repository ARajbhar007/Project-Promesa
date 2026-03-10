const express = require('express');
const router = express.Router();
const { getComplaints, fileComplaint, updateComplaint } = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getComplaints).post(protect, fileComplaint);
router.route('/:id').put(protect, updateComplaint);

module.exports = router;
