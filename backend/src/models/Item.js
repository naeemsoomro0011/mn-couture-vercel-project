const mongoose = require('mongoose');

/**
 * Each size an admin adds is its own price + picture + stock — this covers
 * both normal S/M/L/XL clothing AND newborn items where admin defines custom
 * age-based labels (e.g. "0-1 Month", "1-2 Month") instead of S/M/L/XL.
 * Only the sizes the admin actually adds will ever appear on the product card.
 */
const sizeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // "Small" | "Medium" | "Large" | "Extra Large" | "0-1 Month" ...
    price: { type: Number, required: true, min: 0 },
    picture: { type: String, required: true },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 150 },
    gender: {
      type: String,
      required: true,
      enum: ['men', 'women', 'kids', 'newborn'],
    },
    coverPicture: { type: String, required: true }, // shown on the card before a size is picked
    sizes: {
      type: [sizeSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Item must have at least one size.',
      },
    },
  },
  { timestamps: true }
);

// Used to rank "Top 10 priciest" items on the homepage — based on the
// most expensive size an item offers.
itemSchema.virtual('maxPrice').get(function () {
  if (!this.sizes || this.sizes.length === 0) return 0;
  return Math.max(...this.sizes.map((s) => s.price));
});

itemSchema.virtual('minPrice').get(function () {
  if (!this.sizes || this.sizes.length === 0) return 0;
  return Math.min(...this.sizes.map((s) => s.price));
});

itemSchema.set('toJSON', { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Item', itemSchema);
