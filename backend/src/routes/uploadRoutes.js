const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'mn-couture', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// Public image upload utility used by the signup form (profile pic) and
// the admin panel (item pictures, gallery). Uploaded straight to
// Cloudinary instead of local disk: Vercel's filesystem is
// read-only/ephemeral for serverless functions, so a file saved locally
// would not reliably survive between requests or redeploys. Cloudinary
// gives back a permanent https:// URL that the frontend stores and uses
// as-is (see frontend/src/utils/uploadImage.js).
router.post('/image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Koi image nahi mili.' });
  }

  try {
    const result = await uploadBufferToCloudinary(req.file.buffer);
    res.status(200).json({ success: true, url: result.secure_url });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Image upload failed, please try again.' });
  }
});

module.exports = router;
