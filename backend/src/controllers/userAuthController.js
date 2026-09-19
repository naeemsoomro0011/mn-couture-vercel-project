const validator = require('validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');
const generateToken = require('../utils/generateToken');
const catchAsync = require('../utils/catchAsync');
const deleteUploadedFile = require('../utils/deleteUploadedFile');
const { sendOTPEmail, sendLoginNotificationEmail, sendPasswordChangedEmail } = require('../utils/sendEmail');

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;

/**
 * Step 1 of signup: validates input, stages the account as unverified, and
 * emails an OTP. The account only truly "exists" once verifyRegisterOTP
 * succeeds — matching the "account banega tabhi jab OTP correct ho" spec.
 */
const registerUser = catchAsync(async (req, res) => {
  const { name, email, password, profilePic } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Email is not a valid format.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing && existing.isVerified) {
    return res.status(409).json({ success: false, message: 'It is already used email.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();

  let user;
  if (existing && !existing.isVerified) {
    existing.name = name;
    existing.password = hashedPassword;
    existing.profilePic = profilePic || '';
    existing.otp = otp;
    existing.otpExpiry = Date.now() + OTP_EXPIRY_MS;
    existing.otpPurpose = 'verify-email';
    existing.otpAttempts = 0;
    user = await existing.save();
  } else {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      profilePic: profilePic || '',
      otp,
      otpExpiry: Date.now() + OTP_EXPIRY_MS,
      otpPurpose: 'verify-email',
    });
  }

  await sendOTPEmail({ to: user.email, otp, purpose: 'Account Verification' });

  res.status(200).json({ success: true, message: 'An OTP has been sent to your email.', email: user.email });
});

/** Step 2 of signup: verify the OTP, activate the account, log the user in. */
const verifyRegisterOTP = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select(
    '+otp +otpExpiry +otpPurpose +otpAttempts'
  );

  if (!user || user.otpPurpose !== 'verify-email') {
    return res.status(400).json({ success: false, message: 'Invalid request.' });
  }
  if (!user.otp || user.otpExpiry < Date.now()) {
    return res.status(400).json({ success: false, message: 'The OTP has expired. Please try again.' });
  }
  if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return res.status(400).json({ success: false, message: 'Too many incorrect attempts. Please sign up again.' });
  }
  if (user.otp !== otp) {
    user.otpAttempts += 1;
    await user.save();
    return res.status(400).json({ success: false, message: 'Wrong OTP.' });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpPurpose = undefined;
  user.otpAttempts = 0;
  await user.save();

  generateToken(res, { id: user._id, role: 'user' }, 'token');
  sendLoginNotificationEmail({ to: user.email, name: user.name }).catch((err) => console.error('Email send failed:', err.message));

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    user: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic },
  });
});

/** Resend an OTP for either the signup flow or the password-reset flow. */
const resendOTP = catchAsync(async (req, res) => {
  const { email, purpose } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) return res.status(404).json({ success: false, message: 'Account nahi mila.' });

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = Date.now() + OTP_EXPIRY_MS;
  user.otpPurpose = purpose || user.otpPurpose || 'verify-email';
  user.otpAttempts = 0;
  await user.save();

  await sendOTPEmail({ to: user.email, otp, purpose: 'Verification' });
  res.status(200).json({ success: true, message: 'The OTP has been resent.' });
});

const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.isVerified) {
    return res.status(401).json({ success: false, message: 'Wrong email or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Wrong email or password.' });
  }

  generateToken(res, { id: user._id, role: 'user' }, 'token');
  sendLoginNotificationEmail({ to: user.email, name: user.name }).catch((err) => console.error('Email send failed:', err.message));

  res.status(200).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic },
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase(), isVerified: true });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account found with this email.' });
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = Date.now() + OTP_EXPIRY_MS;
  user.otpPurpose = 'reset-password';
  user.otpAttempts = 0;
  await user.save();

  await sendOTPEmail({ to: user.email, otp, purpose: 'Password Reset' });
  res.status(200).json({ success: true, message: 'An OTP has been sent.' });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select(
    '+otp +otpExpiry +otpPurpose +otpAttempts'
  );

  if (!user || user.otpPurpose !== 'reset-password') {
    return res.status(400).json({ success: false, message: 'Invalid request.' });
  }
  if (!user.otp || user.otpExpiry < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP expire ho chuka hai.' });
  }
  if (user.otp !== otp) {
    user.otpAttempts += 1;
    await user.save();
    return res.status(400).json({ success: false, message: 'Wrong OTP.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpPurpose = undefined;
  user.otpAttempts = 0;
  await user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully.' });
});

const getMe = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// Name/picture change applies immediately.
const updateProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, profilePic } = req.body;
  if (name) user.name = name;
  if (profilePic !== undefined && profilePic !== user.profilePic) {
    deleteUploadedFile(user.profilePic);
    user.profilePic = profilePic;
  }
  await user.save();
  res.status(200).json({ success: true, user });
});

// Email change is a 2-step confirmation, exactly like the brief describes:
// Step 1 — OTP goes to the CURRENT (old) email, proving the requester still
//          owns this account.
// Step 2 — only after that succeeds, a fresh OTP goes to the NEW email,
//          proving they actually own the address they're switching to.
// The email only changes once both succeed.
const requestEmailChange = catchAsync(async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail || !validator.isEmail(newEmail)) {
    return res.status(400).json({ success: false, message: 'Email is not a valid format.' });
  }
  const existing = await User.findOne({ email: newEmail.toLowerCase(), isVerified: true });
  if (existing) {
    return res.status(409).json({ success: false, message: 'It is already used email.' });
  }

  const user = await User.findById(req.user._id);
  const otp = generateOTP();
  user.pendingEmail = newEmail.toLowerCase();
  user.otp = otp;
  user.otpExpiry = Date.now() + OTP_EXPIRY_MS;
  user.otpPurpose = 'change-email-confirm-old';
  user.otpAttempts = 0;
  await user.save();

  await sendOTPEmail({ to: user.email, otp, purpose: 'Email Change Confirmation' });
  res.status(200).json({ success: true, message: 'A confirmation code has been sent to your current email.' });
});

const confirmOldEmail = catchAsync(async (req, res) => {
  const { otp } = req.body;
  const user = await User.findById(req.user._id).select('+otp +otpExpiry +otpPurpose +pendingEmail +otpAttempts');

  if (!user.otp || user.otpPurpose !== 'change-email-confirm-old' || user.otpExpiry < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP expire ho chuka hai.' });
  }
  if (user.otp !== otp) {
    user.otpAttempts += 1;
    await user.save();
    return res.status(400).json({ success: false, message: 'Wrong OTP.' });
  }

  const newOtp = generateOTP();
  user.otp = newOtp;
  user.otpExpiry = Date.now() + OTP_EXPIRY_MS;
  user.otpPurpose = 'change-email-confirm-new';
  user.otpAttempts = 0;
  await user.save();

  await sendOTPEmail({ to: user.pendingEmail, otp: newOtp, purpose: 'New Email Verification' });
  res.status(200).json({ success: true, message: 'Enter the OTP just sent to your new email.' });
});

const confirmNewEmail = catchAsync(async (req, res) => {
  const { otp } = req.body;
  const user = await User.findById(req.user._id).select('+otp +otpExpiry +otpPurpose +pendingEmail +otpAttempts');

  if (!user.otp || user.otpPurpose !== 'change-email-confirm-new' || user.otpExpiry < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP expire ho chuka hai.' });
  }
  if (user.otp !== otp) {
    user.otpAttempts += 1;
    await user.save();
    return res.status(400).json({ success: false, message: 'Wrong OTP.' });
  }

  user.email = user.pendingEmail;
  user.pendingEmail = undefined;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpPurpose = undefined;
  user.otpAttempts = 0;
  await user.save();

  res.status(200).json({ success: true, message: 'Email changed successfully.', user });
});

const logoutUser = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// Change password while logged in — requires the current password.
const updatePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Old password is incorrect.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  sendPasswordChangedEmail({ to: user.email, name: user.name }).catch((err) => console.error('Email send failed:', err.message));

  res.status(200).json({ success: true, message: 'Password changed successfully.' });
});

module.exports = {
  registerUser,
  verifyRegisterOTP,
  resendOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  requestEmailChange,
  confirmOldEmail,
  confirmNewEmail,
  updatePassword,
  logoutUser,
};
