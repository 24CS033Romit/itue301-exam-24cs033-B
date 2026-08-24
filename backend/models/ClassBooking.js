const mongoose = require('mongoose');

const classBookingSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'memberId is required']
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: [true, 'trainerId is required']
  },
  className: {
    type: String,
    required: [true, 'className is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'timeSlot is required'],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['booked', 'attended', 'cancelled'],
      message: '{VALUE} is not a valid booking status'
    },
    default: 'booked'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ClassBooking', classBookingSchema);
