const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const galleryController = require('../controllers/gallery.controller');

// Public: Get all gallery images
router.get('/', galleryController.getGallery);

// Admin only: Upload image
router.post(
  '/',
  protect,
  authorize('admin'),
  galleryController.uploadGalleryImage
);

// Admin only: Delete image
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  galleryController.deleteGalleryImage
);

module.exports = router;
