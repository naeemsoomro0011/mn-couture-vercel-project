const Message = require('../models/Message');
const catchAsync = require('../utils/catchAsync');
const pusher = require('../config/pusher');

// User: get my conversation with the admin
const getMyMessages = catchAsync(async (req, res) => {
  const messages = await Message.find({ user: req.user._id }).sort({ createdAt: 1 });
  await Message.updateMany({ user: req.user._id, sender: 'admin', readByUser: false }, { readByUser: true });
  res.status(200).json({ success: true, messages });
});

// User: send a message to the admin
const sendMyMessage = catchAsync(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
  const message = await Message.create({ user: req.user._id, sender: 'user', text });

  pusher.trigger(['private-admin-room', `private-user-${req.user._id}`], 'newMessage', message);

  res.status(201).json({ success: true, message });
});

module.exports = { getMyMessages, sendMyMessage };
