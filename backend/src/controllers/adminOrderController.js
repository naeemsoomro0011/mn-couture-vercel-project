const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const pusher = require('../config/pusher');

const getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ hiddenFromAdmin: { $ne: true } })
    .populate('user', 'name email profilePic')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, orders });
});

// Powers the notification-badge count on the Inbox nav item.
const getUnseenCount = catchAsync(async (req, res) => {
  const count = await Order.countDocuments({ seenByAdmin: false, hiddenFromAdmin: { $ne: true } });
  res.status(200).json({ success: true, count });
});

const markSeen = catchAsync(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { seenByAdmin: true }, { new: true });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  pusher.trigger('private-admin-room', 'ordersChanged', {});

  res.status(200).json({ success: true, order });
});

// Opening the Inbox page counts as the admin having *seen* every request in
// it — so the "New" / "Unseen" badges clear on view instead of only when the
// admin happens to open a chat or confirm an order.
const markAllSeen = catchAsync(async (req, res) => {
  await Order.updateMany(
    { seenByAdmin: false, hiddenFromAdmin: { $ne: true } },
    { $set: { seenByAdmin: true } }
  );

  pusher.trigger('private-admin-room', 'ordersChanged', {});

  res.status(200).json({ success: true, message: 'All requests marked as seen.' });
});

const approveOrder = catchAsync(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', seenByAdmin: true },
    { new: true }
  );
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  // Only the order id is sent (not the full order/items), so this stays
  // comfortably under Pusher's per-event payload limit no matter how many
  // items an order has.
  pusher.trigger(`private-user-${order.user}`, 'orderApproved', { orderId: order._id });
  pusher.trigger('private-admin-room', 'ordersChanged', {});

  res.status(200).json({ success: true, order });
});

// This only hides the request from the ADMIN's inbox — the shopper's own
// order history is completely untouched, exactly as specced.
const deleteOrder = catchAsync(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { hiddenFromAdmin: true }, { new: true });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  pusher.trigger('private-admin-room', 'ordersChanged', {});

  res.status(200).json({ success: true, message: 'Removed from inbox.' });
});

module.exports = { getAllOrders, getUnseenCount, markSeen, markAllSeen, approveOrder, deleteOrder };
