const express = require('express');
const jwt = require('jsonwebtoken');
const pusher = require('../config/pusher');

const router = express.Router();

// Pusher's client library calls this endpoint (via a custom authorizer -
// see frontend/src/socket.js) whenever a component tries to subscribe to a
// private-* channel, and only completes the subscription if we respond
// with a valid signature here.
router.post('/auth', (req, res) => {
  const { socket_id: socketId, channel_name: channelName } = req.body;

  if (!socketId || !channelName) {
    return res.status(400).json({ message: 'Missing socket_id/channel_name.' });
  }

  let authorized = false;

  if (channelName === 'private-admin-room') {
    const adminToken = req.cookies?.adminToken;
    if (adminToken) {
      try {
        jwt.verify(adminToken, process.env.JWT_SECRET);
        authorized = true;
      } catch { /* expired/invalid admin token - stays unauthorized */ }
    }
  } else if (channelName.startsWith('private-user-')) {
    const userToken = req.cookies?.token;
    if (userToken) {
      try {
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
        if (channelName === `private-user-${decoded.id}`) authorized = true;
      } catch { /* expired/invalid user token - stays unauthorized */ }
    }
  }

  if (!authorized) {
    return res.status(403).json({ message: 'Forbidden.' });
  }

  res.send(pusher.authorizeChannel(socketId, channelName));
});

module.exports = router;
