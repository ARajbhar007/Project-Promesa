const Vehicle = require('../models/Vehicle');

// @desc    Get user's vehicles
// @route   GET /api/vehicles
// @access  Private
const getVehicles = async (req, res, next) => {
  try {
    const query = req.user.role === 'Admin' ? {} : { userId: req.user._id };
    const vehicles = await Vehicle.find(query).populate('userId', 'fullName flatNumber').sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a vehicle
// @route   POST /api/vehicles
// @access  Private
const addVehicle = async (req, res, next) => {
  try {
    const { vehicleType, vehicleNumber, parkingSlot, vehicleModel } = req.body;
    const vehicle = await Vehicle.create({
      userId: req.user._id,
      vehicleType,
      vehicleNumber,
      parkingSlot,
      vehicleModel,
    });
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (vehicle.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (vehicle.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await vehicle.deleteOne();
    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVehicles, addVehicle, updateVehicle, deleteVehicle };
