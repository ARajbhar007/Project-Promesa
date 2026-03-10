const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flatNumber: { type: String, trim: true },
    month: { type: String, required: [true, 'Month is required'] },
    year: { type: Number, required: [true, 'Year is required'] },
    amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue'],
      default: 'Pending',
    },
    paidOn: { type: Date },
    pendingDues: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
