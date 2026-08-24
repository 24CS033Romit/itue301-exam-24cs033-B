const errorHandler = (err, req, res, next) => {
  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Duplicate Key Error (e.g. unique email)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate value error',
      errors: ['A record with this value already exists']
    });
  }

  // General server error (Never expose err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong'
  });
};

module.exports = errorHandler;
