const jwt = require('jsonwebtoken');

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Signs a JWT and sets it as an httpOnly cookie so the browser keeps the
 * user/admin logged in on that device until they explicitly log out
 * (matches the "don't ask me to log in again on this device" requirement).
 *
 * cookieName differs for user vs admin so an admin session and a shopper
 * session can exist in the same browser without colliding.
 */
const generateToken = (res, payload, cookieName = 'token') => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: THIRTY_DAYS_MS,
  });

  return token;
};

module.exports = generateToken;
