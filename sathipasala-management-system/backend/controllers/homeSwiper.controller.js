const HomeSwiperImage = require('../models/homeSwiperImage.model');
const { uploadLearningImage, deleteFromCloudinary } = require('../config/cloudinary');

// GET /api/home-swiper
exports.getSwiperImages = async (req, res) => {
  try {
    const images = await HomeSwiperImage.find().sort({ createdAt: -1 });
    res.json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch swiper images' });
  }
};

// POST /api/home-swiper
exports.uploadSwiperImage = (req, res) => {
  uploadLearningImage.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    try {
      let url = req.file.secure_url || req.file.path;
      let public_id = req.file.public_id || req.file.filename;
      if (!url || !public_id) {
        return res.status(500).json({ success: false, message: 'Cloudinary upload failed (missing URL or public_id)' });
      }
      const newImg = new HomeSwiperImage({
        url,
        public_id,
        title: req.body.title || '',
        description: req.body.description || '',
        link: req.body.link || '',
        uploadedBy: req.user?._id
      });
      await newImg.save();
      res.status(201).json({ success: true, data: newImg });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Image upload failed' });
    }
  });
};

// PUT /api/home-swiper/:id
exports.updateSwiperImage = async (req, res) => {
  try {
    const { title, description, link } = req.body;
    const image = await HomeSwiperImage.findByIdAndUpdate(
      req.params.id,
      { title, description, link },
      { new: true }
    );
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    res.json({ success: true, data: image });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// DELETE /api/home-swiper/:id
exports.deleteSwiperImage = async (req, res) => {
  try {
    const img = await HomeSwiperImage.findById(req.params.id);
    if (!img) return res.status(404).json({ success: false, message: 'Image not found' });
    await deleteFromCloudinary(img.public_id);
    await img.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};
