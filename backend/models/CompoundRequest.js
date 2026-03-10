const mongoose = require('mongoose');

const compoundRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    purpose: { type: String, required: [true, 'Purpose is required'], trim: true },
    requestedDate: { type: Date, required: [true, 'Requested date is required'] },
    startTime: { type: String },
    endTime: { type: String },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminRemarks: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompoundRequest', compoundRequestSchema);
