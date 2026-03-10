const Maintenance = require('../models/Maintenance');

// @desc    Get maintenance records
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceRecords = async (req, res, next) => {
  try {
    const query = req.user.role === 'Admin' ? {} : { userId: req.user._id };
    const records = await Maintenance.find(query)
      .populate('userId', 'fullName flatNumber')
      .sort({ year: -1, month: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Add maintenance record (Admin)
// @route   POST /api/maintenance
// @access  Private/Admin
const addMaintenanceRecord = async (req, res, next) => {
  try {
    const { userId, flatNumber, month, year, amount, status, paidOn, pendingDues } = req.body;

    const targetUserId = req.user.role === 'Admin' ? (userId || req.user._id) : req.user._id;

    const record = await Maintenance.create({
      userId: targetUserId,
      flatNumber,
      month,
      year,
      amount,
      status,
      paidOn,
      pendingDues,
    });
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance record
// @route   PUT /api/maintenance/:id
// @access  Private/Admin
const updateMaintenanceRecord = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    const updated = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMaintenanceRecords, addMaintenanceRecord, updateMaintenanceRecord };
