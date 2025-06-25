const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Check if MONGO_URI is available
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI environment variable is not defined in the .env file');
  console.log('📁 Current .env path:', path.resolve(__dirname, '../.env'));
  process.exit(1);
}

// User schema matching your model
const userSchema = new mongoose.Schema({
  name: {
    en: String,
    si: String
  },
  email: { type: String, unique: true, required: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  firstLogin: { type: Boolean, default: true },
  preferredLanguage: { type: String, default: 'en' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

console.log('🔐 Creating secure administrator account...');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    
    try {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ role: 'admin' });
      
      if (existingAdmin) {
        console.log('⚠️  Admin already exists with email:', existingAdmin.email);
        
        // Update existing admin password if needed
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('BSP@Admin2025!', salt);
        
        existingAdmin.password = hashedPassword;
        existingAdmin.isActive = true;
        await existingAdmin.save();
        
        console.log('✅ Admin password updated successfully!');
      } else {
        // Create new admin
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('BSP@Admin2025!', salt);
        
        const admin = await User.create({
          name: {
            en: 'System Administrator',
            si: 'පද්ධති පරිපාලක'
          },
          email: 'admin@baunseth.edu.lk',
          phone: '0770000000',
          password: hashedPassword,
          role: 'admin',
          firstLogin: true,
          preferredLanguage: 'en',
          isActive: true
        });
        
        console.log('✅ Admin user created successfully!');
        console.log('👤 Admin ID:', admin._id);
      }
      
      console.log('');
      console.log('🔑 ADMIN LOGIN CREDENTIALS:');
      console.log('📧 Email: admin@baunseth.edu.lk');
      console.log('🔒 Password: BSP@Admin2025!');
      console.log('🌐 Secure Login URL: http://localhost:3000/bsp/login/admin');
      console.log('');
      console.log('⚠️  SECURITY REMINDERS:');
      console.log('   • Change password after first login');
      console.log('   • Keep login URL confidential');
      console.log('   • Use HTTPS in production');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error creating/updating admin user:', error.message);
      if (error.code === 11000) {
        console.log('💡 Duplicate key error - admin might already exist');
      }
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });