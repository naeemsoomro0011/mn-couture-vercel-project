const mongoose = require('mongoose');

// Singleton — the app always reads/writes the single ShopInfo document
// (created on first server start by seedShopInfo).
const shopInfoSchema = new mongoose.Schema(
  {
    shopName: { type: String, default: 'MN Couture' },
    logoUrl: { type: String, default: '' },
    description: { type: String, maxlength: 220, default: '' },
    ownerName: { type: String, default: 'Muhammad Naeem' },
    phone: { type: String, default: '03159833357' },
    whatsapp: { type: String, default: '03159833357' },
    email: { type: String, default: 'muhammadnaeemsoomro123@gmail.com' },
    mapLink: { type: String, default: '' },
    // Resolved server-side from mapLink whenever it's a Google Maps share
    // link (see resolveMapLink) — lets the embedded preview point at the
    // exact pin instead of falling back to a generic address search.
    mapLat: { type: Number, default: null },
    mapLng: { type: Number, default: null },
    address: { type: String, default: 'Sukkur, Sindh, Pakistan' },
    timing: { type: String, default: '' },
    facebook: { type: String, default: 'https://www.facebook.com/share/1EaDhsaNZG/' },
    instagram: { type: String, default: 'https://www.instagram.com/muhammad__naeem__' },
    tiktok: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShopInfo', shopInfoSchema);
