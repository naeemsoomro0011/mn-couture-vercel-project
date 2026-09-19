const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const ShopInfo = require('../models/ShopInfo');

// Creates the first admin account (from .env) if no admin exists yet, and
// creates the single ShopInfo document if it doesn't exist yet. Safe to run
// on every server start — it only ever creates, never overwrites.
const seedDefaults = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_DEFAULT_PASSWORD || 'admin$123',
        10
      );
      await Admin.create({
        name: 'Admin',
        email: (process.env.ADMIN_DEFAULT_EMAIL || 'admin@gmail.com').toLowerCase(),
        password: hashedPassword,
      });
      console.log(`✔ Default admin account created: ${process.env.ADMIN_DEFAULT_EMAIL}`);
    }

    const shopInfoCount = await ShopInfo.countDocuments();
    if (shopInfoCount === 0) {
      await ShopInfo.create({});
      console.log('✔ Default shop info document created');
    }
  } catch (error) {
    console.error('✘ Seeding failed:', error.message);
  }
};

module.exports = seedDefaults;
