const Item = require('../models/Item');
const catchAsync = require('../utils/catchAsync');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Public: top 10 items ranked by their most expensive size — empty array
// until the admin actually adds items, which is exactly what the brief asks for.
const getTopPriced = catchAsync(async (req, res) => {
  const items = await Item.find({});
  const sorted = items
    .map((i) => i.toJSON())
    .sort((a, b) => b.maxPrice - a.maxPrice)
    .slice(0, 10);

  res.status(200).json({ success: true, items: sorted });
});

// Public: list items, optionally filtered by gender/section, search, and price range.
// Uses a case-insensitive partial match rather than MongoDB's word-tokenized
// $text search, which could match unrelated items (e.g. "kids-1" also
// matching "Female-1" since both tokenize down to include "1").
const getItems = catchAsync(async (req, res) => {
  const { gender, search, minPrice, maxPrice, size } = req.query;
  const query = {};

  if (gender) query.gender = gender;
  if (search) query.name = { $regex: escapeRegex(search.trim()), $options: 'i' };

  let items = await Item.find(query).sort({ createdAt: -1 });
  items = items.map((i) => i.toJSON());

  if (minPrice) items = items.filter((i) => i.maxPrice >= Number(minPrice));
  if (maxPrice) items = items.filter((i) => i.minPrice <= Number(maxPrice));
  if (size) items = items.filter((i) => i.sizes.some((s) => s.label === size));

  res.status(200).json({ success: true, items });
});

const getItemById = catchAsync(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
  res.status(200).json({ success: true, item });
});

module.exports = { getTopPriced, getItems, getItemById };
