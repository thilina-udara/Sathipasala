const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the correct path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Check if MONGO_URI is available
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI environment variable is not defined in the .env file');
  console.log('Current .env path:', path.resolve(__dirname, '../.env'));
  process.exit(1);
}

// Define a simplified User schema for this script
const userSchema = new mongoose.Schema({
  name: {
    en: String,
    si: String
  },
  email: String,
  phone: String,
  password: String,
  role: String,
  firstLogin: Boolean,
  preferredLanguage: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Connect to the database
console.log('Connecting to MongoDB with URI:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      // Check if admin already exists
      const adminExists = await User.findOne({ role: 'admin' });
      
      if (adminExists) {
        console.log('Admin already exists with email:', adminExists.email);
        process.exit(0);
      }
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password123!', salt);
      
      // Create admin user
      const admin = await User.create({
        name: {
          en: 'Thilina',
          si: 'තිලීන'
        },
        email: 'admin@sathipasala.org',
        phone: '0770000000',
        password: hashedPassword,
        role: 'admin',
        firstLogin: true,
        preferredLanguage: 'en'
      });
      
      console.log('Admin user created successfully:');
      console.log('Email:', admin.email);
      console.log('Password: Password123!');
      console.log('IMPORTANT: Please change the password after first login');
      
      process.exit(0);
    } catch (error) {
      console.error('Error creating admin user:', error.message);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });