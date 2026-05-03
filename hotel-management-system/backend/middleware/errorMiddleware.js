// // backend/middleware/errorMiddleware.js
// const errorHandler = (err, req, res, next) => {
//   console.error(err.stack);

//   // Mongoose validation error
//   if (err.name === 'ValidationError') {
//     const messages = Object.values(err.errors).map(error => error.message);
//     return res.status(400).json({
//       message: 'Validation Error',
//       errors: messages
//     });
//   }

//   // Mongoose duplicate key error
//   if (err.code === 11000) {
//     const field = Object.keys(err.keyValue)[0];
//     return res.status(400).json({
//       message: `Duplicate field value for ${field}. This ${field} already exists.`
//     });
//   }

//   // JWT errors
//   if (err.name === 'JsonWebTokenError') {
//     return res.status(401).json({ message: 'Invalid token' });
//   }

//   if (err.name === 'TokenExpiredError') {
//     return res.status(401).json({ message: 'Token expired' });
//   }

//   res.status(err.statusCode || 500).json({
//     message: err.message || 'Internal Server Error',
//     stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   });
// };

// module.exports = { errorHandler };\



// middleware/errorMiddleware.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = { errorHandler };