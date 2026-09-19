const express = require('express');
const router = express.Router();
const { getMyMessages, sendMyMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getMyMessages);
router.post('/', sendMyMessage);

module.exports = router;
