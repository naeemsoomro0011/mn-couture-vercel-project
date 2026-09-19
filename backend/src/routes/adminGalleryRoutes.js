const express = require('express');
const router = express.Router();
const { addGalleryImages, updateGalleryImage, deleteGalleryImage, getAdminGallery } = require('../controllers/adminGalleryController');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');

router.use(protectAdmin);
router.get('/', getAdminGallery);
router.post('/', addGalleryImages);
router.patch('/:id', updateGalleryImage);
router.delete('/:id', deleteGalleryImage);

module.exports = router;
