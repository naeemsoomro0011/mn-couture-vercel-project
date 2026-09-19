const express = require('express');
const router = express.Router();
const {
  updateProfile,
  requestEmailChange,
  confirmOldEmail,
  confirmNewEmail,
  updatePassword,
} = require('../controllers/adminProfileController');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');

router.use(protectAdmin);
router.patch('/', updateProfile);
router.post('/request-email-change', requestEmailChange);
router.post('/confirm-old-email', confirmOldEmail);
router.post('/confirm-new-email', confirmNewEmail);
router.patch('/password', updatePassword);

module.exports = router;
