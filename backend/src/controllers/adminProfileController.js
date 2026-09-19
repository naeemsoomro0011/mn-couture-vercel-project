const bcrypt = require('bcryptjs');
const validator = require('validator');
const Admin = require('../models/Admin');
const generateOTP = require('../utils/generateOTP');
const catchAsync = require('../utils/catchAsync');
const deleteUploadedFile = require('../utils/deleteUploadedFile');
const { sendOTPEmail, sendPasswordChangedEmail } = require('../utils/sendEmail');

const OTP_EXPIRY_MS = 10 * 60 * 1000;

// Name/picture/number changes apply immediately.
const updateProfile = catchAsync(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);
  const { name, profilePic, number, whatsappNumber } = req.body;
  if (name) admin.name = name;
  if (profilePic !== undefined && profilePic !== admin.profilePic) {
    deleteUploadedFile(admin.profilePic);
    admin.profilePic = profilePic;
  }
  if (number !== undefined) admin.number = number;
  if (whatsappNumber !== undefined) admin.whatsappNumber = whatsappNumber;
  await admin.save();
  res.status(200).json({ success: true, admin });
});

// Same 2-step email-change flow as the shopper side: OTP confirms on the
// OLD email first, then a second OTP verifies the NEW email.
const requestEmailChange = catchAsync(async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail || !validator.isEmail(newEmail)) {
    return res.status(400).json({ success: false, message: 'Email is not a valid format.' });
  }
  const admin = await Admin.findById(req.admin._id);
  const otp = generateOTP();
  admin.pendingEmail = newEmail.toLowerCase();
  admin.otp = otp;
  admin.otpExpiry = Date.now() + OTP_EXPIRY_MS;
  admin.otpPurpose = 'change-email-confirm-old';
  admin.otpAttempts = 0;
  await admin.save();

  await sendOTPEmail({ to: admin.email, otp, purpose: 'Email Change Confirmation' });
  res.status(200).json({ success: true, message: 'A confirmation code has been sent to your current email.' });
});

const confirmOldEmail = catchAsync(async (req, res) => {
  const { otp } = req.body;
  const admin = await Admin.findById(req.admin._id).select('+otp +otpExpiry +otpPurpose +pendingEmail +otpAttempts');

  if (!admin.otp || admin.otpPurpose !== 'change-email-confirm-old' || admin.otpExpiry < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP expire ho chuka hai.' });
  }
  if (admin.otp !== otp) {
    admin.otpAttempts += 1;
    await admin.save();
    return res.status(400).json({ success: false, message: 'Wrong OTP.' });
  }

  const newOtp = generateOTP();
  admin.otp = newOtp;
  admin.otpExpiry = Date.now() + OTP_EXPIRY_MS;
  admin.otpPurpose = 'change-email-confirm-new';
  admin.otpAttempts = 0;
  await admin.save();

  await sendOTPEmail({ to: admin.pendingEmail, otp: newOtp, purpose: 'New Email Verification' });
  res.status(200).json({ success: true, message: 'Enter the OTP just sent to your new email.' });
});

const confirmNewEmail = catchAsync(async (req, res) => {
  const { otp } = req.body;
  const admin = await Admin.findById(req.admin._id).select('+otp +otpExpiry +otpPurpose +pendingEmail +otpAttempts');

  if (!admin.otp || admin.otpPurpose !== 'change-email-confirm-new' || admin.otpExpiry < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP expire ho chuka hai.' });
  }
  if (admin.otp !== otp) {
    admin.otpAttempts += 1;
    await admin.save();
    return res.status(400).json({ success: false, message: 'Wrong OTP.' });
  }

  admin.email = admin.pendingEmail;
  admin.pendingEmail = undefined;
  admin.otp = undefined;
  admin.otpExpiry = undefined;
  admin.otpPurpose = undefined;
  admin.otpAttempts = 0;
  await admin.save();

  res.status(200).json({ success: true, message: 'Email changed successfully.', admin });
});

const updatePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.admin._id).select('+password');
  const isMatch = await bcrypt.compare(oldPassword, admin.password);
  if (!isMatch) return res.status(400).json({ success: false, message: 'Old password is incorrect.' });
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }
  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();

  sendPasswordChangedEmail({ to: admin.email, name: admin.name }).catch((err) => console.error('Email send failed:', err.message));

  res.status(200).json({ success: true, message: 'Password changed successfully.' });
});

module.exports = { updateProfile, requestEmailChange, confirmOldEmail, confirmNewEmail, updatePassword };
