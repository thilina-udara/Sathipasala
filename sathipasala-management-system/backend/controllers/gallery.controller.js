const GalleryImage = require('../models/gallery.model');
const { uploadLearningImage, deleteFromCloudinary } = require('../config/cloudinary');

// GET /api/gallery
exports.getGallery = async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ createdAt: -1 });
    res.json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch gallery images' });
  }
};

// POST /api/gallery
exports.uploadGalleryImage = (req, res) => {
  uploadLearningImage.single('image')(req, res, async (err) => {
    if (err) {
      console.error('Gallery upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    try {
      // Defensive: Check for secure_url and public_id
      // Cloudinary's multer-storage-cloudinary puts the info on req.file.path (url) and req.file.filename (public_id)
      let url = req.file.secure_url || req.file.path;
      let public_id = req.file.public_id || req.file.filename;

      if (!url || !public_id) {
        console.error('Cloudinary upload missing url or public_id:', req.file);
        return res.status(500).json({ success: false, message: 'Cloudinary upload failed (missing URL or public_id)' });
      }

      const newImg = new GalleryImage({
        url,
        public_id,
        alt: req.body.alt || '',
        uploadedBy: req.user?._id
      });
      await newImg.save();
      res.status(201).json({ success: true, data: newImg });
    } catch (error) {
      console.error('Gallery DB save error:', error);
      res.status(500).json({ success: false, message: 'Image upload failed' });
    }
  });
};

// DELETE /api/gallery/:id
exports.deleteGalleryImage = async (req, res) => {
  try {
    const img = await GalleryImage.findById(req.params.id);
    if (!img) return res.status(404).json({ success: false, message: 'Image not found' });
    await deleteFromCloudinary(img.public_id);
    await img.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};
