// updated seeder.js (Run: node seeder.js to create sample users)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();
const User = require('./models/User');
const Room = require('./models/Room');
const Guest = require('./models/Guest');
const Hotel = require('./models/Hotel');

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luxury_hotel');
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Guest.deleteMany({});
    console.log('Cleared existing data');

    // ========== CREATE USERS (ALL ROLES) ==========
    const users = await User.create([
      {
        name: 'System Admin',
        email: 'admin@luxurystay.com',
        password: 'admin123',
        role: 'admin',
        department: 'Management',
        phone: '1234567890',
        status: 'Active'
      },
      {
        name: 'Sarah Manager',
        email: 'manager@luxurystay.com',
        password: 'manager123',
        role: 'manager',
        department: 'Operations',
        phone: '1234567891',
        status: 'Active'
      },
      {
        name: 'John Receptionist',
        email: 'receptionist@luxurystay.com',
        password: 'reception123',
        role: 'receptionist',
        department: 'Front Desk',
        phone: '1234567892',
        status: 'Active'
      },
      {
        name: 'Maria Housekeeper',
        email: 'housekeeping@luxurystay.com',
        password: 'house123',
        role: 'housekeeping',
        department: 'Housekeeping',
        phone: '1234567893',
        status: 'Active'
      },
      {
        name: 'Tom Maintenance',
        email: 'maintenance@luxurystay.com',
        password: 'maintain123',
        role: 'maintenance',
        department: 'Maintenance',
        phone: '1234567894',
        status: 'Active'
      }
    ]);

    console.log('Users created:');
    users.forEach(u => console.log(`  ${u.role}: ${u.email} / ${u.password || 'see above'}`));


    // Add to backend/seeder.js after room creation:

const Hotel = require('./models/Hotel');

// Create sample hotels for gallery
const hotels = await Hotel.create([
  {
    name: 'Grand Plaza Hotel',
    location: 'Dubai, UAE',
    description: 'Experience unparalleled luxury at Grand Plaza Hotel with stunning views of Burj Khalifa.',
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80'],
    rating: 4.8,
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Parking', 'Gym'],
    rooms: [
      { roomNumber: '101', type: 'Deluxe', price: 350, capacity: 2, status: 'Available' },
      { roomNumber: '102', type: 'Suite', price: 550, capacity: 3, status: 'Available' },
      { roomNumber: '103', type: 'Presidential', price: 1200, capacity: 6, status: 'Available' }
    ],
    createdBy: users[0]._id
  },
  {
    name: 'Ocean Paradise Resort',
    location: 'Maldives',
    description: 'Overwater bungalows with crystal clear waters and private beaches.',
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'],
    rating: 4.9,
    amenities: ['Free WiFi', 'Overwater Pool', 'Private Beach', 'Spa', 'Water Sports'],
    rooms: [
      { roomNumber: '201', type: 'Overwater Villa', price: 550, capacity: 2, status: 'Available' },
      { roomNumber: '202', type: 'Beach Villa', price: 450, capacity: 3, status: 'Available' }
    ],
    createdBy: users[0]._id
  },
  {
    name: 'Mountain View Lodge',
    location: 'Swiss Alps, Switzerland',
    description: 'Cozy mountain retreat with breathtaking alpine views.',
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'],
    rating: 4.7,
    amenities: ['Free WiFi', 'Fireplace', 'Ski Storage', 'Restaurant', 'Sauna'],
    rooms: [
      { roomNumber: '301', type: 'Standard', price: 280, capacity: 2, status: 'Available' },
      { roomNumber: '302', type: 'Deluxe', price: 380, capacity: 3, status: 'Available' }
    ],
    createdBy: users[0]._id
  },
  {
    name: 'Royal Grand Hotel',
    location: 'London, UK',
    description: 'Historic luxury hotel combining classic elegance with modern amenities.',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'],
    rating: 4.8,
    amenities: ['Free WiFi', 'Afternoon Tea', 'Concierge', 'Restaurant', 'Bar'],
    rooms: [
      { roomNumber: '401', type: 'Classic', price: 420, capacity: 2, status: 'Available' },
      { roomNumber: '402', type: 'Royal Suite', price: 1200, capacity: 4, status: 'Available' }
    ],
    createdBy: users[0]._id
  },
  {
    name: 'Sunset Beach Hotel',
    location: 'Bali, Indonesia',
    description: 'Tropical paradise with stunning sunsets and Balinese hospitality.',
    images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80'],
    rating: 4.6,
    amenities: ['Free WiFi', 'Beachfront', 'Yoga Classes', 'Restaurant', 'Pool'],
    rooms: [
      { roomNumber: '501', type: 'Garden View', price: 190, capacity: 2, status: 'Available' },
      { roomNumber: '502', type: 'Ocean View', price: 290, capacity: 2, status: 'Available' }
    ],
    createdBy: users[0]._id
  },
  {
    name: 'Metropolitan Hotel',
    location: 'New York, USA',
    description: 'Modern luxury in Manhattan, close to Times Square and Central Park.',
    images: ['https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800&q=80'],
    rating: 4.7,
    amenities: ['Free WiFi', 'Rooftop Bar', 'Fitness Center', 'Restaurant', 'Business Lounge'],
    rooms: [
      { roomNumber: '601', type: 'Standard', price: 380, capacity: 2, status: 'Available' },
      { roomNumber: '602', type: 'Penthouse', price: 1800, capacity: 6, status: 'Available' }
    ],
    createdBy: users[0]._id
  }
]);

console.log(`${hotels.length} Hotels created for gallery`);
    // ========== CREATE ROOMS ==========
    const rooms = await Room.create([
      { roomNumber: '101', type: 'Standard', floor: '1st Floor', price: 100, capacity: 2, status: 'Available', amenities: ['WiFi', 'TV', 'Air Conditioning'] },
      { roomNumber: '102', type: 'Standard', floor: '1st Floor', price: 100, capacity: 2, status: 'Available', amenities: ['WiFi', 'TV'] },
      { roomNumber: '103', type: 'Standard', floor: '1st Floor', price: 100, capacity: 2, status: 'Occupied', amenities: ['WiFi', 'TV', 'Air Conditioning'] },
      { roomNumber: '201', type: 'Deluxe', floor: '2nd Floor', price: 200, capacity: 3, status: 'Available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'] },
      { roomNumber: '202', type: 'Deluxe', floor: '2nd Floor', price: 200, capacity: 3, status: 'Occupied', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'] },
      { roomNumber: '203', type: 'Deluxe', floor: '2nd Floor', price: 200, capacity: 3, status: 'Cleaning', amenities: ['WiFi', 'TV', 'Mini Bar'] },
      { roomNumber: '301', type: 'Suite', floor: '3rd Floor', price: 500, capacity: 4, status: 'Available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi'] },
      { roomNumber: '302', type: 'Suite', floor: '3rd Floor', price: 500, capacity: 4, status: 'Occupied', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Balcony'] },
      { roomNumber: '401', type: 'Presidential', floor: '4th Floor', price: 1000, capacity: 6, status: 'Available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Balcony', 'Kitchen', 'Workspace'] },
      { roomNumber: '402', type: 'Presidential', floor: '4th Floor', price: 1000, capacity: 6, status: 'Maintenance', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Balcony', 'Kitchen'] }
    ]);

    console.log(`\n${rooms.length} Rooms created`);

    // ========== CREATE SAMPLE GUESTS ==========
    const guests = await Guest.create([
      { firstName: 'Ahmed', lastName: 'Khan', email: 'ahmed.khan@email.com', phone: '3001234567', totalStays: 5, vipStatus: true },
      { firstName: 'Fatima', lastName: 'Ali', email: 'fatima.ali@email.com', phone: '3001234568', totalStays: 3, vipStatus: false },
      { firstName: 'Bilal', lastName: 'Ahmed', email: 'bilal.ahmed@email.com', phone: '3001234569', totalStays: 8, vipStatus: true },
      { firstName: 'Ayesha', lastName: 'Hussain', email: 'ayesha.h@email.com', phone: '3001234570', totalStays: 1, vipStatus: false },
      { firstName: 'Omar', lastName: 'Farooq', email: 'omar.f@email.com', phone: '3001234571', totalStays: 12, vipStatus: true }
    ]);

    console.log(`${guests.length} Guests created`);

    await mongoose.disconnect();
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin:        admin@luxurystay.com / admin123');
    console.log('  Manager:      manager@luxurystay.com / manager123');
    console.log('  Receptionist: receptionist@luxurystay.com / reception123');
    console.log('  Housekeeping: housekeeping@luxurystay.com / house123');
    console.log('  Maintenance:  maintenance@luxurystay.com / maintain123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedAll();  