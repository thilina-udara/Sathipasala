const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const homeSwiperController = require('../controllers/homeSwiper.controller');

// Public: Get all swiper images
router.get('/', homeSwiperController.getSwiperImages);

// Admin only: Upload image
router.post(
  '/',
  protect,
  authorize('admin'),
  homeSwiperController.uploadSwiperImage
);

// Admin only: Update image
router.put(
  '/:id',
  protect,
  authorize('admin'),
  homeSwiperController.updateSwiperImage
);

// Admin only: Delete image
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  homeSwiperController.deleteSwiperImage
);

module.exports = router;
