const ShopInfo = require('../models/ShopInfo');
const catchAsync = require('../utils/catchAsync');
const deleteUploadedFile = require('../utils/deleteUploadedFile');
const resolveMapLink = require('../utils/resolveMapLink');

const FIELDS = ['shopName', 'logoUrl', 'description', 'ownerName', 'phone', 'whatsapp', 'email', 'mapLink', 'address', 'timing', 'facebook', 'instagram', 'tiktok'];

const updateShopInfo = catchAsync(async (req, res) => {
  let info = await ShopInfo.findOne({}).sort({ createdAt: 1 });
  if (!info) info = new ShopInfo({});

  if (req.body.logoUrl !== undefined && req.body.logoUrl !== info.logoUrl) {
    deleteUploadedFile(info.logoUrl);
  }

  const mapLinkChanged = req.body.mapLink !== undefined && req.body.mapLink !== info.mapLink;

  FIELDS.forEach((f) => {
    if (req.body[f] !== undefined) info[f] = req.body[f];
  });

  if (info.description && info.description.length > 220) {
    return res.status(400).json({ success: false, message: 'Description cannot exceed 220 characters.' });
  }

  // A new map link makes any previously-resolved pin stale — re-resolve
  // (or clear it) so the embedded map on the site always matches whatever
  // was just pasted, not what used to be there.
  if (mapLinkChanged) {
    const coords = await resolveMapLink(info.mapLink);
    info.mapLat = coords ? coords.lat : null;
    info.mapLng = coords ? coords.lng : null;
  }

  await info.save();
  res.status(200).json({ success: true, shopInfo: info });
});

module.exports = { updateShopInfo };
