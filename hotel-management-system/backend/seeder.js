// backend/seeder.js - ENHANCED WITH REALISTIC DEMO DATA
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();
const User = require('./models/User');
const Room = require('./models/Room');
const Guest = require('./models/Guest');
const Hotel = require('./models/Hotel');
const Reservation = require('./models/Reservation');
const Invoice = require('./models/Invoice');
const Feedback = require('./models/Feedback');
const HousekeepingTask = require('./models/HousekeepingTask');
const MaintenanceRequest = require('./models/MaintenanceRequest');

// Helper function to generate random dates
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random amount
const randomAmount = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luxury_hotel');
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Guest.deleteMany({});
    await Hotel.deleteMany({});
    console.log('Cleared existing data');

    // ========== CREATE USERS ==========
    const users = await User.create([
      { name: 'System Admin', email: 'admin@luxurystay.com', password: 'admin123', role: 'admin', department: 'Management', phone: '1234567890', status: 'Active' },
      { name: 'Sarah Manager', email: 'manager@luxurystay.com', password: 'manager123', role: 'manager', department: 'Operations', phone: '1234567891', status: 'Active' },
      { name: 'John Receptionist', email: 'receptionist@luxurystay.com', password: 'reception123', role: 'receptionist', department: 'Front Desk', phone: '1234567892', status: 'Active' },
      { name: 'Maria Housekeeper', email: 'housekeeping@luxurystay.com', password: 'house123', role: 'housekeeping', department: 'Housekeeping', phone: '1234567893', status: 'Active' },
      { name: 'Tom Maintenance', email: 'maintenance@luxurystay.com', password: 'maintain123', role: 'maintenance', department: 'Maintenance', phone: '1234567894', status: 'Active' },
      { name: 'Guest User', email: 'guest@gmail.com', password: 'guest123', role: 'guest', department: 'guest', phone: '1234567895', status: 'Active' }
    ]);

    console.log('Users created:');
    users.forEach(u => console.log(`  ${u.role}: ${u.email}`));

    // ========== CREATE ROOMS IN ROOMS COLLECTION ==========
    const rooms = await Room.create([
      { roomNumber: '101', type: 'Deluxe', floor: '1st Floor', price: 350, capacity: 2, status: 'Available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'] },
      { roomNumber: '102', type: 'Suite', floor: '1st Floor', price: 550, capacity: 3, status: 'Available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi'] },
      { roomNumber: '103', type: 'Presidential', floor: '1st Floor', price: 1200, capacity: 6, status: 'Available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Balcony', 'Kitchen'] },
      { roomNumber: '201', type: 'Deluxe', floor: '2nd Floor', price: 450, capacity: 3, status: 'Available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'] },
      { roomNumber: '202', type: 'Suite', floor: '2nd Floor', price: 650, capacity: 4, status: 'Available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Balcony'] },
      { roomNumber: '301', type: 'Standard', floor: '3rd Floor', price: 280, capacity: 2, status: 'Available', amenities: ['WiFi', 'TV', 'Air Conditioning'] },
      { roomNumber: '302', type: 'Deluxe', floor: '3rd Floor', price: 380, capacity: 3, status: 'Available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'] },
      { roomNumber: '401', type: 'Standard', floor: '4th Floor', price: 150, capacity: 2, status: 'Available', amenities: ['WiFi', 'TV'] },
      { roomNumber: '402', type: 'Deluxe', floor: '4th Floor', price: 250, capacity: 2, status: 'Available', amenities: ['WiFi', 'TV', 'Air Conditioning'] },
      { roomNumber: '403', type: 'Suite', floor: '4th Floor', price: 450, capacity: 3, status: 'Available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'] },
    ]);

    console.log(`${rooms.length} Rooms created in Rooms collection`);

    // ========== CREATE HOTELS WITH ROOM REFERENCES ==========
    const hotels = await Hotel.create([
      {
        name: 'Grand Plaza Hotel',
        location: 'Dubai, UAE',
        description: 'Experience unparalleled luxury at Grand Plaza Hotel with stunning views of Burj Khalifa.',
        images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80'],
        rating: 4.8,
        amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Parking', 'Gym'],
        rooms: rooms.slice(0, 3).map(room => ({
          _id: room._id,
          roomNumber: room.roomNumber,
          type: room.type,
          price: room.price,
          capacity: room.capacity,
          status: room.status
        })),
        createdBy: users[0]._id
      },
      {
        name: 'Ocean Paradise Resort',
        location: 'Maldives',
        description: 'Overwater bungalows with crystal clear waters and private beaches.',
        images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'],
        rating: 4.9,
        amenities: ['Free WiFi', 'Overwater Pool', 'Private Beach', 'Spa', 'Water Sports'],
        rooms: rooms.slice(3, 6).map(room => ({
          _id: room._id,
          roomNumber: room.roomNumber,
          type: room.type,
          price: room.price,
          capacity: room.capacity,
          status: room.status
        })),
        createdBy: users[0]._id
      },
      {
        name: 'Mountain View Lodge',
        location: 'Swiss Alps, Switzerland',
        description: 'Cozy mountain retreat with breathtaking alpine views.',
        images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'],
        rating: 4.7,
        amenities: ['Free WiFi', 'Fireplace', 'Ski Storage', 'Restaurant', 'Sauna'],
        rooms: rooms.slice(6, 8).map(room => ({
          _id: room._id,
          roomNumber: room.roomNumber,
          type: room.type,
          price: room.price,
          capacity: room.capacity,
          status: room.status
        })),
        createdBy: users[0]._id
      },
      {
        name: 'Royal Grand Hotel',
        location: 'London, UK',
        description: 'Historic luxury hotel combining classic elegance with modern amenities.',
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'],
        rating: 4.8,
        amenities: ['Free WiFi', 'Afternoon Tea', 'Concierge', 'Restaurant', 'Bar'],
        rooms: rooms.slice(8, 11).map(room => ({
          _id: room._id,
          roomNumber: room.roomNumber,
          type: room.type,
          price: room.price,
          capacity: room.capacity,
          status: room.status
        })),
        createdBy: users[0]._id
      }
    ]);

    console.log(`${hotels.length} Hotels created`);

    // ========== CREATE SAMPLE GUESTS ==========
    const guests = await Guest.create([
      { firstName: 'Ahmed', lastName: 'Khan', email: 'ahmed.khan@email.com', phone: '3001234567', totalStays: 5, vipStatus: true },
      { firstName: 'Fatima', lastName: 'Ali', email: 'fatima.ali@email.com', phone: '3001234568', totalStays: 3, vipStatus: false },
      { firstName: 'Bilal', lastName: 'Ahmed', email: 'bilal.ahmed@email.com', phone: '3001234569', totalStays: 8, vipStatus: true },
      { firstName: 'Ayesha', lastName: 'Hussain', email: 'ayesha.h@email.com', phone: '3001234570', totalStays: 1, vipStatus: false },
      { firstName: 'Omar', lastName: 'Farooq', email: 'omar.f@email.com', phone: '3001234571', totalStays: 12, vipStatus: true }
    ]);

    console.log(`${guests.length} Guests created`);

    // ========== CREATE RESERVATIONS ==========
    const reservations = [];
    const now = new Date();
    
    for (let i = 0; i < 15; i++) {
      const checkIn = randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
      const checkOut = new Date(checkIn.getTime() + randomAmount(1, 7) * 24 * 60 * 60 * 1000);
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const guest = guests[Math.floor(Math.random() * guests.length)];
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      const totalAmount = room.price * nights;
      
      const status = checkOut < now ? 'Checked Out' : 
                    checkIn <= now && checkOut > now ? 'Checked In' :
                    checkIn > now ? 'Confirmed' : 'Pending';
      
      reservations.push({
        guest: guest._id,
        guestName: `${guest.firstName} ${guest.lastName}`,
        email: guest.email,
        phone: guest.phone,
        room: room._id,
        roomNumber: room.roomNumber,
        checkIn,
        checkOut,
        adults: randomAmount(1, 2),
        children: Math.random() > 0.7 ? randomAmount(1, 2) : 0,
        status,
        totalAmount,
        paymentStatus: status === 'Checked Out' ? 'Paid' : Math.random() > 0.3 ? 'Paid' : 'Pending',
        paymentMethod: ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer'][Math.floor(Math.random() * 4)],
        specialRequests: Math.random() > 0.6 ? ['Late check-out', 'Extra towels', 'Airport pickup'][Math.floor(Math.random() * 3)] : '',
        createdBy: users[2]._id // Receptionist
      });
    }

    const createdReservations = await Reservation.create(reservations);
    console.log('Reservations created:', createdReservations.length);

    // ========== CREATE INVOICES ==========
    const invoices = [];
    for (const reservation of createdReservations) {
      const additionalServices = Math.random() > 0.5 ? [
        {
          description: 'Room Service',
          amount: randomAmount(25, 150),
          date: randomDate(reservation.checkIn, reservation.checkOut)
        },
        {
          description: 'Laundry Service',
          amount: randomAmount(20, 80),
          date: randomDate(reservation.checkIn, reservation.checkOut)
        }
      ] : [];


      const additionalChargesTotal = additionalServices.reduce((sum, service) => sum + service.amount, 0);
      const taxAmount = (reservation.totalAmount + additionalChargesTotal) * 0.15;
      const totalAmount = reservation.totalAmount + additionalChargesTotal + taxAmount;
      const paidAmount = reservation.paymentStatus === 'Paid' ? totalAmount : Math.random() > 0.5 ? totalAmount * 0.5 : 0;
      const balance = totalAmount - paidAmount;

      invoices.push({
        reservation: reservation._id,
        guest: reservation.guest,
        roomCharges: reservation.totalAmount,
        additionalServices,
        additionalChargesTotal,
        taxRate: 15,
        taxAmount,
        totalAmount,
        paidAmount,
        balance,
        status: balance === 0 ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Issued',
        issuedDate: reservation.checkIn,
        dueDate: new Date(reservation.checkIn.getTime() + 7 * 24 * 60 * 60 * 1000),
        paymentHistory: paidAmount > 0 ? [{
          amount: paidAmount,
          method: reservation.paymentMethod,
          date: reservation.checkIn,
          reference: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }] : [],
        notes: balance > 0 ? 'Payment pending' : 'Fully paid'
      });
    }

    const createdInvoices = await Invoice.create(invoices);
    console.log('Invoices created:', createdInvoices.length);

    // ========== CREATE FEEDBACK ==========
    const feedbacks = [];
    for (let i = 0; i < 20; i++) {
      const reservation = createdReservations[Math.floor(Math.random() * createdReservations.length)];
      const rating = randomAmount(3, 5);
      
      feedbacks.push({
        guest: reservation.guest,
        reservation: reservation._id,
        rating,
        categories: {
          cleanliness: randomAmount(3, 5),
          service: randomAmount(3, 5),
          comfort: randomAmount(3, 5),
          location: randomAmount(3, 5),
          valueForMoney: randomAmount(3, 5)
        },
        title: ['Excellent Stay', 'Great Experience', 'Wonderful Service', 'Comfortable Room', 'Perfect Location'][Math.floor(Math.random() * 5)],
        comment: [
          'Amazing hotel with excellent service. The staff was very helpful and room was spotless.',
          'Great location and comfortable beds. Would definitely stay here again.',
          'The breakfast buffet was fantastic and check-in process was smooth.',
          'Beautiful room with great amenities. The housekeeping staff did an excellent job.',
          'Perfect for our family vacation. Kids loved the pool and staff was very accommodating.'
        ][Math.floor(Math.random() * 5)],
        suggestions: Math.random() > 0.7 ? 'More variety in breakfast options' : '',
        status: ['Pending', 'Reviewed', 'Addressed'][Math.floor(Math.random() * 3)],
        isPublic: Math.random() > 0.2
      });
    }

    await Feedback.create(feedbacks);
    console.log('Feedback created:', feedbacks.length);

    // ========== CREATE HOUSEKEEPING TASKS ==========
    const housekeepingTasks = [];
    const taskTypes = ['Cleaning', 'Deep Cleaning', 'Turndown', 'Linen Change', 'Inspection'];
    const priorities = ['Low', 'Medium', 'High', 'Urgent'];
    const statuses = ['Pending', 'In Progress', 'Completed'];
    
    for (let i = 0; i < 25; i++) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const scheduledDate = randomDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
      
      housekeepingTasks.push({
        room: room._id,
        roomNumber: room.roomNumber,
        assignedTo: users[3]._id, // Housekeeping staff
        taskType: taskTypes[Math.floor(Math.random() * taskTypes.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        scheduledDate,
        completedDate: Math.random() > 0.5 ? new Date(scheduledDate.getTime() + randomAmount(1, 4) * 60 * 60 * 1000) : undefined,
        notes: Math.random() > 0.6 ? ['Guest requested extra towels', 'Deep clean needed', 'Special attention required'][Math.floor(Math.random() * 3)] : '',
        createdBy: users[1]._id // Manager
      });
    }

    await HousekeepingTask.create(housekeepingTasks);
    console.log('Housekeeping tasks created:', housekeepingTasks.length);

    // ========== CREATE MAINTENANCE REQUESTS ==========
    const maintenanceRequests = [];
    const categories = ['Plumbing', 'Electrical', 'HVAC', 'Furniture', 'Appliance', 'Other'];
    const issues = [
      'Air conditioning not working properly',
      'Leaky faucet in bathroom',
      'TV remote not functioning',
      'Room light flickering',
      'Wi-Fi connection weak',
      'Mini bar not cooling',
      'Safe not opening',
      'Balcony door stuck'
    ];
    
    for (let i = 0; i < 15; i++) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      
      maintenanceRequests.push({
        room: room._id,
        roomNumber: room.roomNumber,
        reportedBy: users[2]._id, // Receptionist
        assignedTo: users[4]._id, // Maintenance staff
        issue: issues[Math.floor(Math.random() * issues.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: ['Reported', 'Assigned', 'In Progress', 'Completed'][Math.floor(Math.random() * 4)],
        completedDate: Math.random() > 0.6 ? new Date(now.getTime() - randomAmount(1, 48) * 60 * 60 * 1000) : undefined,
        cost: Math.random() > 0.7 ? randomAmount(50, 500) : 0,
        notes: Math.random() > 0.5 ? 'Guest reported issue during check-in' : ''
      });
    }

    await MaintenanceRequest.create(maintenanceRequests);
    console.log('Maintenance requests created:', maintenanceRequests.length);

    // ========== SUMMARY ==========
    console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY! 🎉');
    console.log('\n📊 SUMMARY:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🛏️ Rooms: ${rooms.length}`);
    console.log(`   👨‍👩‍👧‍👦 Guests: ${guests.length}`);
    console.log(`   📅 Reservations: ${createdReservations.length}`);
    console.log(`   💰 Invoices: ${createdInvoices.length}`);
    console.log(`   ⭐ Feedback: ${feedbacks.length}`);
    console.log(`   🧹 Housekeeping Tasks: ${housekeepingTasks.length}`);
    console.log(`   🔧 Maintenance Requests: ${maintenanceRequests.length}`);
    console.log(`   🏨 Hotels: ${1}`);
    
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('   📧 Admin: admin@luxurystay.com / admin123');
    console.log('   👨‍💼 Manager: manager@luxurystay.com / manager123');
    console.log('   🛎️ Receptionist: receptionist@luxurystay.com / reception123');
    console.log('   🧹 Housekeeping: housekeeping@luxurystay.com / house123');
    console.log('   🔧 Maintenance: maintenance@luxurystay.com / maintain123');
    console.log('   👤 Guest: emma.guest@gmail.com / guest123');
    
    console.log('\n💰 FINANCIAL SUMMARY:');
    const totalRevenue = createdInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalPending = createdInvoices.reduce((sum, inv) => sum + inv.balance, 0);
    console.log(`   💵 Total Revenue: $${totalRevenue.toLocaleString()}`);
    console.log(`   ⏳ Pending Amount: $${totalPending.toLocaleString()}`);
    console.log(`   📈 Average Invoice: $${Math.round(totalRevenue / createdInvoices.length).toLocaleString()}`);

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 MongoDB disconnected');
  }
};

// Run seeder
if (require.main === module) {
  seedAll();
}

module.exports = seedAll;