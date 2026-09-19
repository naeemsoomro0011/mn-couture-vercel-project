const Item = require('../models/Item');
const catchAsync = require('../utils/catchAsync');
const deleteUploadedFile = require('../utils/deleteUploadedFile');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createItem = catchAsync(async (req, res) => {
  const { name, description, gender, sizes } = req.body;
  if (!name || !description || !gender || !sizes || sizes.length === 0) {
    return res.status(400).json({ success: false, message: 'All fields and at least one size are required.' });
  }
  // The admin no longer uploads a separate cover image — the first size's
  // picture IS the cover shown on the product card.
  const coverPicture = req.body.coverPicture || sizes[0]?.picture;
  if (!coverPicture) {
    return res.status(400).json({ success: false, message: 'Each size needs a picture — the first one is used as the cover.' });
  }
  if (description.length > 150) {
    return res.status(400).json({ success: false, message: 'Description cannot exceed 150 characters.' });
  }

  const existing = await Item.findOne({ name: { $regex: `^${escapeRegex(name.trim())}$`, $options: 'i' } });
  if (existing) {
    return res.status(409).json({ success: false, message: 'An item with this name already exists — names must be unique.' });
  }

  const item = await Item.create({ name: name.trim(), description, gender, coverPicture, sizes });
  res.status(201).json({ success: true, item });
});

const updateItem = catchAsync(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

  const { name, description, gender, sizes } = req.body;
  if (name) {
    const existing = await Item.findOne({
      _id: { $ne: item._id },
      name: { $regex: `^${escapeRegex(name.trim())}$`, $options: 'i' },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An item with this name already exists — names must be unique.' });
    }
    item.name = name.trim();
  }
  if (description) {
    if (description.length > 150) {
      return res.status(400).json({ success: false, message: 'Description cannot exceed 150 characters.' });
    }
    item.description = description;
  }
  if (gender) item.gender = gender;

  // Clean up any picture files that got replaced, so uploads/ never fills
  // up with orphaned old images.
  if (sizes) {
    const oldPictures = item.sizes.map((s) => s.picture);
    const newPictures = sizes.map((s) => s.picture);
    oldPictures.filter((p) => !newPictures.includes(p)).forEach(deleteUploadedFile);
    item.sizes = sizes;
  }

  // Cover always mirrors the first size's picture now. Only delete the old
  // cover file if nothing else still points at it — otherwise we'd wipe an
  // image that a size is actively using.
  const newCover = req.body.coverPicture || item.sizes[0]?.picture;
  if (newCover && newCover !== item.coverPicture) {
    const stillInUse = item.sizes.some((s) => s.picture === item.coverPicture);
    if (!stillInUse) deleteUploadedFile(item.coverPicture);
    item.coverPicture = newCover;
  }

  await item.save();
  res.status(200).json({ success: true, item });
});

const deleteItem = catchAsync(async (req, res) => {
  const item = await Item.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

  const sizePictures = item.sizes.map((s) => s.picture);
  if (!sizePictures.includes(item.coverPicture)) deleteUploadedFile(item.coverPicture);
  sizePictures.forEach(deleteUploadedFile);

  res.status(200).json({ success: true, message: 'Item deleted.' });
});

// Case-insensitive partial match (not MongoDB's word-tokenized $text search,
// which was matching unrelated items — e.g. "kids-1" matching "Female-1"
// because both tokenize down to include "1").
const getAdminItems = catchAsync(async (req, res) => {
  const { search } = req.query;
  const query = search ? { name: { $regex: escapeRegex(search.trim()), $options: 'i' } } : {};
  const items = await Item.find(query).sort({ createdAt: -1 });
  res.status(200).json({ success: true, items });
});

module.exports = { createItem, updateItem, deleteItem, getAdminItems };
