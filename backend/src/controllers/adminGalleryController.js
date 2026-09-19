const Gallery = require('../models/Gallery');
const catchAsync = require('../utils/catchAsync');
const deleteUploadedFile = require('../utils/deleteUploadedFile');

const addGalleryImages = catchAsync(async (req, res) => {
  const { images } = req.body; // array of { imageUrl, caption }
  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one image is required.' });
  }
  const created = await Gallery.insertMany(images);
  res.status(201).json({ success: true, images: created });
});

const updateGalleryImage = catchAsync(async (req, res) => {
  const image = await Gallery.findById(req.params.id);
  if (!image) return res.status(404).json({ success: false, message: 'Image not found.' });
  const { imageUrl, caption } = req.body;
  if (imageUrl && imageUrl !== image.imageUrl) {
    deleteUploadedFile(image.imageUrl);
    image.imageUrl = imageUrl;
  }
  if (caption !== undefined) image.caption = caption;
  await image.save();
  res.status(200).json({ success: true, image });
});

const deleteGalleryImage = catchAsync(async (req, res) => {
  const image = await Gallery.findByIdAndDelete(req.params.id);
  if (!image) return res.status(404).json({ success: false, message: 'Image not found.' });
  deleteUploadedFile(image.imageUrl);
  res.status(200).json({ success: true, message: 'Image deleted.' });
});

const getAdminGallery = catchAsync(async (req, res) => {
  const { search } = req.query;
  const query = search ? { caption: { $regex: search, $options: 'i' } } : {};
  const images = await Gallery.find(query).sort({ createdAt: -1 });
  res.status(200).json({ success: true, images });
});

module.exports = { addGalleryImages, updateGalleryImage, deleteGalleryImage, getAdminGallery };
