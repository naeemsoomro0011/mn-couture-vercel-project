const mongoose = require('mongoose');

// Snapshot of the item at the moment it was ordered, so later edits/deletes
// to the product itself never corrupt an existing order's history.
const orderItemSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    name: { type: String, required: true },
    picture: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Order must contain at least one item.',
      },
    },
    totalPrice: { type: Number, required: true, min: 0 },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
    seenByAdmin: { type: Boolean, default: false },
    hiddenFromAdmin: { type: Boolean, default: false }, // admin "delete" only sets this — the user's own order history is untouched
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
