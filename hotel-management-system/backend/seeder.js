// seeder.js (Run: node seeder.js to create admin user)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Delete existing admin if exists
    await User.deleteMany({ role: 'admin' });

    // Create admin user
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@luxurystay.com',
      password: 'admin123',
      role: 'admin',
      department: 'Management',
      phone: '1234567890',
      status: 'Active'
    });

    console.log('Admin user created:');
    console.log(`Email: admin@luxurystay.com`);
    console.log(`Password: admin123`);
    
    await mongoose.disconnect();
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedAdmin();