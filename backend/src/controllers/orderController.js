const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const pusher = require('../config/pusher');

// @desc Create a purchase request (goes to admin's Inbox in a later phase)
const createOrder = catchAsync(async (req, res) => {
  const { items, address, phone } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Please select at least one item.' });
  }
  if (!address || !phone) {
    return res.status(400).json({ success: false, message: 'Address and phone number are required.' });
  }

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await Order.create({
    user: req.user._id,
    items,
    totalPrice,
    address,
    phone,
  });

  pusher.trigger('private-admin-room', 'newOrder', { orderId: order._id });

  res.status(201).json({ success: true, message: 'Your request has been sent to the shop.', order });
});

// @desc Logged-in user's own orders — powers the navbar Orders dropdown
const getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, orders });
});

// @desc Edit an order — only allowed while admin hasn't seen it yet
const updateMyOrder = catchAsync(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: 'Order nahi mila.' });
  if (order.seenByAdmin) {
    return res.status(400).json({ success: false, message: 'Admin ne dekh liya hai, ab edit nahi ho sakta.' });
  }

  const { items, address, phone } = req.body;
  if (items) {
    order.items = items;
    order.totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }
  if (address) order.address = address;
  if (phone) order.phone = phone;
  await order.save();

  res.status(200).json({ success: true, message: 'Order updated.', order });
});

module.exports = { createOrder, getMyOrders, updateMyOrder };
