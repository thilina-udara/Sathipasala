const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for different content types
const createStorage = (folder, transformations = []) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `${process.env.CLOUDINARY_FOLDER}/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'],
      transformation: transformations,
      public_id: (req, file) => {
        const timestamp = Date.now();
        const originalName = file.originalname.split('.')[0];
        return `${originalName}_${timestamp}`;
      },
    },
  });
};

// Different storage configurations
const studentPhotos = createStorage('students', [
  { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto:good' }
]);

const learningContent = createStorage('learning-content', [
  { width: 800, height: 600, crop: 'limit', quality: 'auto:good' }
]);

const learningDocuments = createStorage('learning-documents');

// Create upload middleware
const uploadStudentPhoto = multer({
  storage: studentPhotos,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed for student photos!'), false);
    }
  },
});

const uploadLearningImage = multer({
  storage: learningContent,
  limits: { fileSize: 5 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed for learning content!'), false);
    }
  },
});

const uploadLearningDocument = multer({
  storage: learningDocuments,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents allowed!'), false);
    }
  },
});

// Helper functions
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options
  });
};

module.exports = {
  cloudinary,
  uploadStudentPhoto,
  uploadLearningImage,
  uploadLearningDocument,
  deleteFromCloudinary,
  getOptimizedUrl
};