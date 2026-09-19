// 6-digit numeric OTP, e.g. "042817"
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

module.exports = generateOTP;
