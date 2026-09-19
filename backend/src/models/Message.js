const mongoose = require('mongoose');

// One thread per user (the whole shop only has one admin), so "user" identifies
// which conversation a message belongs to regardless of who sent it.
const messageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: String, enum: ['user', 'admin'], required: true },
    text: { type: String, required: true, trim: true },
    readByAdmin: { type: Boolean, default: false },
    readByUser: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
