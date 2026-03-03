const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong!";

  // Mongo duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    message = "Email already exists";
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid Token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token Expired";
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;