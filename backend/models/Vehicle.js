const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleType: { type: String, enum: ['Car', 'Bike', 'Other'], required: true },
    vehicleNumber: { type: String, required: [true, 'Vehicle number is required'], trim: true, uppercase: true },
    parkingSlot: { type: String, trim: true },
    vehicleModel: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
