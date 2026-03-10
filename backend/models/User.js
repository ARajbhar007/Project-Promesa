const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Personal Information
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: { type: String, required: [true, 'Mobile number is required'], trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    profilePhoto: { type: String },
    emergencyContact: { type: String, trim: true },

    // Flat / House Information
    tower: { type: String, trim: true },
    flatNumber: { type: String, required: [true, 'Flat number is required'], trim: true },
    floorNumber: { type: Number },
    flatType: { type: String, enum: ['1BHK', '2BHK', '3BHK', 'Studio'] },
    ownershipType: { type: String, enum: ['Owner', 'Tenant'] },
    moveInDate: { type: Date },

    // Account Information
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6 },
    role: { type: String, enum: ['Resident', 'Admin', 'Security'], default: 'Resident' },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
