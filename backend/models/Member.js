const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  membershipType: {
    type: String,
    enum: {
      values: ['basic', 'premium', 'platinum'],
      message: '{VALUE} is not a valid membership type'
    },
    default: 'basic'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Member', memberSchema);
