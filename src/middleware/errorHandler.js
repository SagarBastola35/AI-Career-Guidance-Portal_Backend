// backend/src/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  let message = err.message;

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    message = "Duplicate field value entered";
    res.status(400);
  }

  // Handle Mongoose validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    res.status(400);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token";
    res.status(401);
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
