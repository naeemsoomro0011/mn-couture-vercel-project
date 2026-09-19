const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const catchAsync = require('../utils/catchAsync');

const protectAdmin = catchAsync(async (req, res, next) => {
  const token = req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin login required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin account nahi mila.' });
    }
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Your session has expired, please log in again.' });
  }
});

module.exports = { protectAdmin };
