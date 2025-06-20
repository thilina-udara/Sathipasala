const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory with proper permissions
const uploadsDir = path.join(__dirname, 'public/uploads');
console.log(`Setting up uploads directory at: ${uploadsDir}`);

// Create directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Successfully created uploads directory');
    // Set permissions (not needed for Windows, but useful for Linux/Mac)
    try {
      fs.chmodSync(uploadsDir, 0o777);
    } catch (err) {
      console.log('Note: Could not set directory permissions (normal on Windows)');
    }
  } catch (err) {
    console.error('Failed to create uploads directory:', err);
  }
}

// Test write access to the uploads directory
try {
  const testFile = path.join(uploadsDir, 'test-write.txt');
  fs.writeFileSync(testFile, 'Testing write access');
  fs.unlinkSync(testFile);
  console.log('✓ Upload directory is writable');
} catch (err) {
  console.error('❌ Upload directory is NOT writable:', err.message);
}

// Import routes
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const holidaysRoutes = require('./routes/holidays.routes');
const statsRoutes = require('./routes/stats.routes'); // Add this with your other routes

// Import the attendance setup function
const { setupAttendanceCollection } = require('./models/Attendance');

// Import database repair utility
const { repairAttendanceCollection } = require('./utils/dbRepair');

// Connect to MongoDB and set up collections
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Run database repair on startup
    console.log('Repairing database collections...');
    await repairAttendanceCollection();
    console.log('Database repair completed');
    
    // Continue with server startup
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Mount routes
console.log('Registering API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/holidays', holidaysRoutes);
app.use('/api/stats', statsRoutes); // Register the routes

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Sathipasala Management System API',
    status: 'Server is running'
  });
});

// Explicitly serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
console.log(`Serving static files from: ${path.join(__dirname, 'public/uploads')}`);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;