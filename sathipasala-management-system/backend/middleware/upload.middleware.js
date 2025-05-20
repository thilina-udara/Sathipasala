const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Make sure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory from middleware');
}

// Configure storage with better naming
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create a more reliable unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `student-${uniqueSuffix}${ext}`;
    console.log(`Generated filename for upload: ${filename}`);
    cb(null, filename);
  }
});

// Filter for image files only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log(`Rejected file of type: ${file.mimetype}`);
    cb(new Error('Only JPEG, PNG and GIF images are allowed.'), false);
  }
};

// Initialize with better error handling
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;