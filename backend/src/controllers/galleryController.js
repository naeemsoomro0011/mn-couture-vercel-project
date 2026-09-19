const Gallery = require('../models/Gallery');
const catchAsync = require('../utils/catchAsync');

const getGallery = catchAsync(async (req, res) => {
  const images = await Gallery.find({}).sort({ createdAt: -1 });
  res.status(200).json({ success: true, images });
});

module.exports = { getGallery };
