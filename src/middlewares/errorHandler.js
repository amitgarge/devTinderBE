const errorHandler = (err, req, res, next) => {
  console.error("ERROR: ", err);
  let statusCode = err.statusCode || 500;
  let message = err.message || "Somwthing went wrong!";

  //mongo duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = "Email already exists";
  }

  //mongoose validation error
  if (err.name === "validationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  //JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Inalid Token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token Expired";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};

module.exports = errorHandler;
