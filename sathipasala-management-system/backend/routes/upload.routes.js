const express = require('express');
const router = express.Router();
const { uploadStudentPhoto, uploadLearningImage, uploadLearningDocument } = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth.middleware');

// Custom authorization middleware for admin only
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  // Check if user exists and role is set
  console.log('User role check:', {
    role: req.user.role,
    roleType: typeof req.user.role,
    user: req.user.email
  });
  
  // More flexible role check - accept any case variation of "admin"
  if (typeof req.user.role === 'string' && req.user.role.toLowerCase() === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: `User role '${req.user.role}' is not authorized. Required: admin`
  });
};

// Upload student profile photo
router.post('/student-photo', 
  protect, 
  adminOnly,
  (req, res) => {
    console.log('Student photo upload route hit');
    console.log('User:', req.user.email, 'Role:', req.user.role);
    
    uploadStudentPhoto.single('image')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      console.log('File uploaded successfully to Cloudinary:', req.file);
      
      // FIX: Map the correct fields from Cloudinary response
      const url = req.file.secure_url || req.file.path;
      const publicId = req.file.public_id || req.file.filename?.split('/').pop();
      
      console.log('Mapped fields:');
      console.log('URL:', url);
      console.log('Public ID:', publicId);

      res.status(200).json({
        success: true,
        message: 'Student photo uploaded successfully',
        data: {
          url: url,
          public_id: publicId,
          filename: req.file.originalname || 'student-photo'
        }
      });
    });
  }
);

// Upload learning content image
router.post('/learning-image', 
  protect, 
  adminOnly,
  (req, res) => {
    uploadLearningImage.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: req.file.secure_url,
          public_id: req.file.public_id,
          filename: req.file.originalname
        }
      });
    });
  }
);

// Upload learning document
router.post('/learning-document', 
  protect, 
  adminOnly,
  (req, res) => {
    uploadLearningDocument.single('document')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          url: req.file.secure_url,
          public_id: req.file.public_id,
          filename: req.file.originalname,
          fileType: req.file.mimetype
        }
      });
    });
  }
);

module.exports = router;