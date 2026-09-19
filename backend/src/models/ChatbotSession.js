const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    text: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

const chatbotSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Chat' },
    messages: [chatMessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatbotSession', chatbotSessionSchema);
