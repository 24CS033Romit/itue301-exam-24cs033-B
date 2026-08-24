const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// Standard Middlewares
app.use(cors());
app.use(express.json());

// Global Request Logger (Must be before routes)
app.use(requestLogger);

// Root Health Check
app.get('/', (req, res) => {
  res.json({ message: 'FitZone Gym API is running successfully' });
});

// REST API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trainers', trainerRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// Global Error Handler Middleware (LAST)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
