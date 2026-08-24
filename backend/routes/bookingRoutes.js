const express = require('express');
const ClassBooking = require('../models/ClassBooking');
const authGuard = require('../middleware/authGuard');

const router = express.Router();

// Apply authGuard to all booking routes
router.use(authGuard);

// GET /api/v1/bookings (Get all bookings for Admin Panel)
router.get('/', async (req, res, next) => {
  try {
    const bookings = await ClassBooking.find()
      .populate('memberId', 'name email')
      .populate('trainerId', 'name specialization')
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/bookings (Create a booking)
router.post('/', async (req, res, next) => {
  try {
    const { trainerId, className, date, timeSlot } = req.body;

    if (!trainerId || !className || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide trainerId, className, date, and timeSlot'
      });
    }

    const memberId = req.member._id || req.member.memberId;

    // Check for duplicate active booking for the same member and session
    const existingBooking = await ClassBooking.findOne({
      memberId,
      className,
      date,
      timeSlot,
      status: 'booked'
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You have already booked this session'
      });
    }

    const booking = await ClassBooking.create({
      memberId,
      trainerId,
      className,
      date,
      timeSlot,
      status: 'booked'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/bookings/my (Get current member's bookings)
router.get('/my', async (req, res, next) => {
  try {
    const memberId = req.member._id || req.member.memberId;
    const bookings = await ClassBooking.find({ memberId })
      .populate('memberId', 'name email')
      .populate('trainerId', 'name specialization');

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/bookings/:id/status (Update booking status)
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['booked', 'attended', 'cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be booked, attended, or cancelled'
      });
    }

    const booking = await ClassBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
