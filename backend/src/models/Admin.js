const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, default: 'Admin' },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    profilePic: { type: String, default: '' },
    number: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },

    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpPurpose: {
      type: String,
      enum: ['reset-password', 'change-email-confirm-old', 'change-email-confirm-new'],
      select: false,
    },
    otpAttempts: { type: Number, default: 0, select: false },
    pendingEmail: { type: String, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
