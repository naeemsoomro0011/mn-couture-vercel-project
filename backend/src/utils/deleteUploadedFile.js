const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

/**
 * Deletes a previously-uploaded image, whatever it's stored as:
 *  - a Cloudinary URL (all uploads since the Vercel migration) - deletes
 *    it from the Cloudinary account via its public_id
 *  - an old local "/uploads/xxx.jpg" URL (anything uploaded before that
 *    migration) - deletes the file from local disk, same as before
 * Safe no-op for anything else (pasted external image links, or a file
 * that's already gone).
 */
const deleteUploadedFile = (url) => {
  if (!url || typeof url !== 'string') return;

  if (url.includes('/uploads/')) {
    const filename = path.basename(url.split('?')[0].split('#')[0]);
    const filePath = path.join(uploadsDir, filename);

    // Guard against path traversal and ensure we're only ever deleting
    // something that actually lives inside uploads/.
    if (!filePath.startsWith(uploadsDir)) return;

    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error(`Could not delete old upload ${filename}:`, err.message);
      }
    });
    return;
  }

  if (url.includes('res.cloudinary.com')) {
    const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)\.[a-zA-Z0-9]+$/);
    if (!match) return;
    const publicId = match[1];
    cloudinary.uploader.destroy(publicId).catch((err) => {
      console.error(`Could not delete Cloudinary image ${publicId}:`, err.message);
    });
  }
};

module.exports = deleteUploadedFile;
