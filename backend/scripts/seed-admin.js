require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin if exists (to fix double-hash issue)
await User.deleteOne({ email: 'admin@neu.edu.ph' });

// Create admin with plain password (model will hash it)
const admin = await User.create({
  name: 'System Admin',
  email: 'admin@neu.edu.ph',
  passwordHash: 'admin123',
  studentId: 'ADMIN001',
  role: 'admin'
});
    console.log('Admin account created successfully');
    console.log('Email: admin@neu.edu.ph');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();