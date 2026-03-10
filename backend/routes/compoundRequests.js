const express = require('express');
const router = express.Router();
const { getCompoundRequests, createCompoundRequest, updateCompoundRequest } = require('../controllers/compoundRequestController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getCompoundRequests).post(protect, createCompoundRequest);
router.route('/:id').put(protect, updateCompoundRequest);

module.exports = router;
