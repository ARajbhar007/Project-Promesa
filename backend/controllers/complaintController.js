const Complaint = require('../models/Complaint');

// @desc    Get complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const query = req.user.role === 'Admin' ? {} : { userId: req.user._id };
    const complaints = await Complaint.find(query)
      .populate('userId', 'fullName flatNumber')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    next(error);
  }
};

// @desc    File a complaint
// @route   POST /api/complaints
// @access  Private
const fileComplaint = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const complaint = await Complaint.create({
      userId: req.user._id,
      title,
      description,
      category,
    });
    res.status(201).json(complaint);
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Only admin can change status; resident can only update their own
    if (req.user.role !== 'Admin' && complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getComplaints, fileComplaint, updateComplaint };
