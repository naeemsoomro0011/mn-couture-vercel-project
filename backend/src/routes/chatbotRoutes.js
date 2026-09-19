const express = require('express');
const router = express.Router();
const {
  sendMessage, streamMessage, getSessions, getSession, deleteSession,
} = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Streamed reply (Server-Sent Events) — what the chat widget uses by default.
router.post('/message/stream', streamMessage);

// Plain JSON reply — kept as the automatic fallback if streaming isn't available.
router.post('/message', sendMessage);

router.get('/sessions', getSessions);
router.get('/sessions/:id', getSession);
router.delete('/sessions/:id', deleteSession);

module.exports = router;
