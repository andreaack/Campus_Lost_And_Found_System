require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin@neu.edu.ph' });
    if (existingAdmin) {
      console.log('Admin account already exists');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@neu.edu.ph',
      passwordHash: 'admin123',
      studentId: 'ADMIN001',
      role: 'admin',
    });

    console.log('Admin account created successfully');
    console.log('Email: admin@neu.edu.ph');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
