const mongoose = require("mongoose");
const Trainer = require("../models/Trainer");
const Member = require("../models/Member");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Seed sample trainers if collection is empty
    const trainerCount = await Trainer.countDocuments();
    if (trainerCount === 0) {
      await Trainer.create([
        { name: "Priya Sharma", specialization: "Yoga & Mindfulness", available: true },
        { name: "Vikram Rathore", specialization: "HIIT & CrossFit", available: true },
        { name: "Amit Patel", specialization: "Strength & Bodybuilding", available: true },
        { name: "Sneha Roy", specialization: "Dance Fitness", available: true }
      ]);
    }

    // Seed sample member if collection is empty
    const memberCount = await Member.countDocuments();
    if (memberCount === 0) {
      await Member.create({
        name: "Rahul Sharma",
        email: "member@fitzone.com",
        membershipType: "basic"
      });
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
