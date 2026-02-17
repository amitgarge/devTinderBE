const jwt = require("jsonwebtoken");
const User = require("../models/user");
const AppError = require("../util/AppError");
const asyncHandler = require("../util/asyncHandler");

const userAuth = asyncHandler(async (req, res, next) => {
  if (!req.cookies) {
    return res.status(401).send("Invalid Token");
  }

  const { token } = req.cookies || {};
  if (!token) return next(new AppError("Authentication token missing", 401));

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
  const user = await User.findById(decoded._id);

  if (!user) {
    return next(new AppError("User no longer exists", 401));
  }

  req.user = user;
  next();
});

module.exports = { userAuth };
