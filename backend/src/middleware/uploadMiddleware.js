const multer = require('multer');
const path = require('path');

// Files are kept in memory (never written to local disk) and streamed
// straight to Cloudinary in the controller. This works identically on
// Vercel - whose filesystem is read-only/ephemeral for serverless
// functions - and on a normal local server, so uploaded images now persist
// reliably in both environments.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
