const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  forgotPassword,
  resetPassword,
  getMe,
  logoutAdmin,
} = require('../controllers/adminAuthController');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');

router.post('/login', loginAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protectAdmin, getMe);
router.post('/logout', protectAdmin, logoutAdmin);

module.exports = router;
