const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const generateOTP = require('../utils/generateOTP');
const generateToken = require('../utils/generateToken');
const catchAsync = require('../utils/catchAsync');
const { sendOTPEmail, sendLoginNotificationEmail } = require('../utils/sendEmail');

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const loginAdmin = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Wrong email or password.' });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Wrong email or password.' });
  }

  generateToken(res, { id: admin._id, role: 'admin' }, 'adminToken');
  sendLoginNotificationEmail({ to: admin.email, name: admin.name }).catch((err) => console.error('Email send failed:', err.message));

  res.status(200).json({
    success: true,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      profilePic: admin.profilePic,
      number: admin.number,
      whatsappNumber: admin.whatsappNumber,
      createdAt: admin.createdAt,
    },
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email: email?.toLowerCase() });
  if (!admin) {
    return res.status(404).json({ success: false, message: 'No admin account found with this email.' });
  }

  const otp = generateOTP();
  admin.otp = otp;
  admin.otpExpiry = Date.now() + OTP_EXPIRY_MS;
  admin.otpPurpose = 'reset-password';
  admin.otpAttempts = 0;
  await admin.save();

  await sendOTPEmail({ to: admin.email, otp, purpose: 'Admin Password Reset' });
  res.status(200).json({ success: true, message: 'An OTP has been sent.' });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const admin = await Admin.findOne({ email: email?.toLowerCase() }).select(
    '+otp +otpExpiry +otpPurpose +otpAttempts'
  );

  if (!admin || admin.otpPurpose !== 'reset-password') {
    return res.status(400).json({ success: false, message: 'Invalid request.' });
  }
  if (!admin.otp || admin.otpExpiry < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP expire ho chuka hai.' });
  }
  if (admin.otp !== otp) {
    admin.otpAttempts += 1;
    await admin.save();
    return res.status(400).json({ success: false, message: 'Wrong OTP.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  admin.password = await bcrypt.hash(newPassword, 10);
  admin.otp = undefined;
  admin.otpExpiry = undefined;
  admin.otpPurpose = undefined;
  admin.otpAttempts = 0;
  await admin.save();

  res.status(200).json({ success: true, message: 'Password changed successfully.' });
});

const getMe = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, admin: req.admin });
});

const logoutAdmin = (req, res) => {
  res.cookie('adminToken', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

module.exports = { loginAdmin, forgotPassword, resetPassword, getMe, logoutAdmin };
