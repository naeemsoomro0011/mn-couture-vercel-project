const express = require('express');
const router = express.Router();
const { getThread, sendToUser } = require('../controllers/adminMessageController');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');

router.use(protectAdmin);
router.get('/:userId', getThread);
router.post('/:userId', sendToUser);

module.exports = router;
