const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Trainer = require('./models/Trainer');
const Member = require('./models/Member');
const ClassBooking = require('./models/ClassBooking');

dotenv.config();

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitzone');
    console.log('MongoDB connected for seeding diverse data...');

    // 1. Seed / Fetch Trainers
    const trainers = await Trainer.find();
    const priya = trainers.find(t => t.name === 'Priya Sharma') || await Trainer.create({ name: 'Priya Sharma', specialization: 'Yoga & Mindfulness', available: true });
    const vikram = trainers.find(t => t.name === 'Vikram Rathore') || await Trainer.create({ name: 'Vikram Rathore', specialization: 'HIIT & CrossFit', available: true });
    const amit = trainers.find(t => t.name === 'Amit Patel') || await Trainer.create({ name: 'Amit Patel', specialization: 'Strength & Bodybuilding', available: true });
    const sneha = trainers.find(t => t.name === 'Sneha Roy') || await Trainer.create({ name: 'Sneha Roy', specialization: 'Dance Fitness', available: true });

    // 2. Seed Diverse Members
    const membersData = [
      { name: 'Rahul Sharma', email: 'member@fitzone.com', membershipType: 'basic' },
      { name: 'Ananya Iyer', email: 'ananya.iyer@fitzone.com', membershipType: 'platinum' },
      { name: 'Rohan Verma', email: 'rohan.verma@fitzone.com', membershipType: 'premium' },
      { name: 'Neha Gupta', email: 'neha.gupta@fitzone.com', membershipType: 'basic' },
      { name: 'Arjun Patel', email: 'arjun.patel@fitzone.com', membershipType: 'platinum' },
      { name: 'Pooja Joshi', email: 'pooja.joshi@fitzone.com', membershipType: 'premium' },
      { name: 'Admin Manager', email: 'admin@fitzone.com', membershipType: 'platinum' }
    ];

    const memberMap = {};
    for (const m of membersData) {
      let existing = await Member.findOne({ email: m.email });
      if (!existing) {
        existing = await Member.create(m);
      } else {
        existing.name = m.name;
        await existing.save();
      }
      memberMap[m.name] = existing;
    }

    // 3. Clear and Re-seed Diverse Bookings
    await ClassBooking.deleteMany({});

    const sampleBookings = [
      {
        memberId: memberMap['Ananya Iyer']._id,
        trainerId: priya._id,
        className: 'Morning Yoga Flow',
        date: new Date('2026-08-25'),
        timeSlot: '07:00 AM - 08:00 AM',
        status: 'booked'
      },
      {
        memberId: memberMap['Rohan Verma']._id,
        trainerId: vikram._id,
        className: 'HIIT Blast',
        date: new Date('2026-08-25'),
        timeSlot: '08:30 AM - 09:15 AM',
        status: 'booked'
      },
      {
        memberId: memberMap['Arjun Patel']._id,
        trainerId: amit._id,
        className: 'Strength & Conditioning',
        date: new Date('2026-08-26'),
        timeSlot: '05:30 PM - 06:30 PM',
        status: 'booked'
      },
      {
        memberId: memberMap['Neha Gupta']._id,
        trainerId: sneha._id,
        className: 'Zumba Dance Fitness',
        date: new Date('2026-08-25'),
        timeSlot: '06:30 PM - 07:30 PM',
        status: 'attended'
      },
      {
        memberId: memberMap['Pooja Joshi']._id,
        trainerId: priya._id,
        className: 'Morning Yoga Flow',
        date: new Date('2026-08-27'),
        timeSlot: '07:00 AM - 08:00 AM',
        status: 'booked'
      },
      {
        memberId: memberMap['Rahul Sharma']._id,
        trainerId: vikram._id,
        className: 'HIIT Blast',
        date: new Date('2026-08-24'),
        timeSlot: '07:00 AM - 08:00 AM',
        status: 'booked'
      }
    ];

    await ClassBooking.insertMany(sampleBookings);
    console.log('✅ Successfully seeded 6 diverse member bookings in MongoDB!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

runSeed();
