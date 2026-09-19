const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/userAuthController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/verify-otp', verifyRegisterOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.post('/profile/request-email-change', protect, requestEmailChange);
router.post('/profile/confirm-old-email', protect, confirmOldEmail);
router.post('/profile/confirm-new-email', protect, confirmNewEmail);
router.patch('/profile/password', protect, updatePassword);
router.post('/logout', protect, logoutUser);

module.exports = router;
