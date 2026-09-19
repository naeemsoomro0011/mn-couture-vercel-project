const Message = require('../models/Message');
const catchAsync = require('../utils/catchAsync');
const pusher = require('../config/pusher');

// Admin: get the conversation thread with a specific user
const getThread = catchAsync(async (req, res) => {
  const messages = await Message.find({ user: req.params.userId }).sort({ createdAt: 1 });
  await Message.updateMany({ user: req.params.userId, sender: 'user', readByAdmin: false }, { readByAdmin: true });
  res.status(200).json({ success: true, messages });
});

// Admin: reply to a specific user
const sendToUser = catchAsync(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
  const message = await Message.create({ user: req.params.userId, sender: 'admin', text });

  pusher.trigger([`private-user-${req.params.userId}`, 'private-admin-room'], 'newMessage', message);

  res.status(201).json({ success: true, message });
});

module.exports = { getThread, sendToUser };
