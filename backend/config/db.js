const mongoose = require("mongoose");
const Trainer = require("../models/Trainer");
const Member = require("../models/Member");
const ClassBooking = require("../models/ClassBooking");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // 1. Seed Trainers
    let priya = await Trainer.findOne({ name: "Priya Sharma" });
    if (!priya) priya = await Trainer.create({ name: "Priya Sharma", specialization: "Yoga & Mindfulness", available: true });

    let vikram = await Trainer.findOne({ name: "Vikram Rathore" });
    if (!vikram) vikram = await Trainer.create({ name: "Vikram Rathore", specialization: "HIIT & CrossFit", available: true });

    let amit = await Trainer.findOne({ name: "Amit Patel" });
    if (!amit) amit = await Trainer.create({ name: "Amit Patel", specialization: "Strength & Bodybuilding", available: true });

    let sneha = await Trainer.findOne({ name: "Sneha Roy" });
    if (!sneha) sneha = await Trainer.create({ name: "Sneha Roy", specialization: "Dance Fitness", available: true });

    // 2. Seed Diverse Members
    const membersData = [
      { name: "Rahul Sharma", email: "member@fitzone.com", membershipType: "basic" },
      { name: "Ananya Iyer", email: "ananya.iyer@fitzone.com", membershipType: "platinum" },
      { name: "Rohan Verma", email: "rohan.verma@fitzone.com", membershipType: "premium" },
      { name: "Neha Gupta", email: "neha.gupta@fitzone.com", membershipType: "basic" },
      { name: "Arjun Patel", email: "arjun.patel@fitzone.com", membershipType: "platinum" },
      { name: "Pooja Joshi", email: "pooja.joshi@fitzone.com", membershipType: "premium" },
      { name: "Admin Manager", email: "admin@fitzone.com", membershipType: "platinum" }
    ];

    const memberMap = {};
    for (const m of membersData) {
      let existing = await Member.findOne({ email: m.email });
      if (!existing) {
        existing = await Member.create(m);
      }
      memberMap[m.name] = existing;
    }

    // 3. Seed Diverse Sample Bookings if less than 6 diverse bookings
    const bookingsCount = await ClassBooking.countDocuments();
    if (bookingsCount < 6) {
      await ClassBooking.deleteMany({}); // clean old monolithic sample bookings

      const sampleBookings = [
        {
          memberId: memberMap["Ananya Iyer"]._id,
          trainerId: priya._id,
          className: "Morning Yoga Flow",
          date: new Date("2026-08-25"),
          timeSlot: "07:00 AM - 08:00 AM",
          status: "booked"
        },
        {
          memberId: memberMap["Rohan Verma"]._id,
          trainerId: vikram._id,
          className: "HIIT Blast",
          date: new Date("2026-08-25"),
          timeSlot: "08:30 AM - 09:15 AM",
          status: "booked"
        },
        {
          memberId: memberMap["Arjun Patel"]._id,
          trainerId: amit._id,
          className: "Strength & Conditioning",
          date: new Date("2026-08-26"),
          timeSlot: "05:30 PM - 06:30 PM",
          status: "booked"
        },
        {
          memberId: memberMap["Neha Gupta"]._id,
          trainerId: sneha._id,
          className: "Zumba Dance Fitness",
          date: new Date("2026-08-25"),
          timeSlot: "06:30 PM - 07:30 PM",
          status: "attended"
        },
        {
          memberId: memberMap["Pooja Joshi"]._id,
          trainerId: priya._id,
          className: "Morning Yoga Flow",
          date: new Date("2026-08-27"),
          timeSlot: "07:00 AM - 08:00 AM",
          status: "booked"
        },
        {
          memberId: memberMap["Rahul Sharma"]._id,
          trainerId: vikram._id,
          className: "HIIT Blast",
          date: new Date("2026-08-24"),
          timeSlot: "07:00 AM - 08:00 AM",
          status: "booked"
        }
      ];

      await ClassBooking.insertMany(sampleBookings);
      console.log("Seeded diverse member bookings successfully");
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
