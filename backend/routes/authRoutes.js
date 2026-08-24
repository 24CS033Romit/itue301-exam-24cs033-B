const express = require('express');
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

const router = express.Router();

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const member = await Member.findOne({ email: email.trim().toLowerCase() });

    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or member not found'
      });
    }

    const token = jwt.sign(
      {
        memberId: member._id,
        role: 'member'
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      member,
      role: 'member'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
