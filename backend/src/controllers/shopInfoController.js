const ShopInfo = require('../models/ShopInfo');
const catchAsync = require('../utils/catchAsync');

const getShopInfo = catchAsync(async (req, res) => {
  const info = await ShopInfo.findOne({}).sort({ createdAt: 1 });
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.status(200).json({ success: true, shopInfo: info });
});

module.exports = { getShopInfo };
