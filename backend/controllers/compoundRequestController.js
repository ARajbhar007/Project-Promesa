const CompoundRequest = require('../models/CompoundRequest');

// @desc    Get compound space requests
// @route   GET /api/compound-requests
// @access  Private
const getCompoundRequests = async (req, res, next) => {
  try {
    const query = req.user.role === 'Admin' ? {} : { userId: req.user._id };
    const requests = await CompoundRequest.find(query)
      .populate('userId', 'fullName flatNumber')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a compound space request
// @route   POST /api/compound-requests
// @access  Private
const createCompoundRequest = async (req, res, next) => {
  try {
    const { purpose, requestedDate, startTime, endTime, description } = req.body;
    const request = await CompoundRequest.create({
      userId: req.user._id,
      purpose,
      requestedDate,
      startTime,
      endTime,
      description,
    });
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status (Admin approve/reject)
// @route   PUT /api/compound-requests/:id
// @access  Private
const updateCompoundRequest = async (req, res, next) => {
  try {
    const request = await CompoundRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (req.user.role !== 'Admin' && request.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await CompoundRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCompoundRequests, createCompoundRequest, updateCompoundRequest };
