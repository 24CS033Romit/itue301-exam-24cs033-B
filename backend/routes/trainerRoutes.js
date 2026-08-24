const express = require('express');
const Trainer = require('../models/Trainer');

const router = express.Router();

// GET /api/v1/trainers (Public)
router.get('/', async (req, res, next) => {
  try {
    const trainers = await Trainer.find();
    res.status(200).json({
      success: true,
      trainers
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
