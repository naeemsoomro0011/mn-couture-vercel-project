const mongoose = require('mongoose');

/**
 * A shopper's account.
 * isVerified stays false until the signup OTP is confirmed — an unverified
 * document is a "pending" account and cannot log in or chat with the admin.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    profilePic: { type: String, default: '' }, // uploaded file URL or external image URL

    isVerified: { type: Boolean, default: false },

    // OTP bookkeeping — never returned by default queries
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpPurpose: {
      type: String,
      enum: ['verify-email', 'reset-password', 'change-email-confirm-old', 'change-email-confirm-new'],
      select: false,
    },
    otpAttempts: { type: Number, default: 0, select: false },
    pendingEmail: { type: String, select: false }, // staged new email during change-email flow
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
