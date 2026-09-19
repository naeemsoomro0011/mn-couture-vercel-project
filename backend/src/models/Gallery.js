const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    caption: { type: String, default: '', maxlength: 150 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema);
