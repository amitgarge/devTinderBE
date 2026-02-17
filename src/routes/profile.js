const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");

const { userAuth } = require("../middlewares/auth");
const { validateUpdate } = require("../util/validators/user.validator");
const asyncHandler = require("../util/asyncHandler");
const AppError = require("../util/AppError");

const User = require("../models/user");

const profileRouter = express.Router();

//View Profile
profileRouter.get("/view", userAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: req.user,
  });
});

//Edit Profile

profileRouter.patch(
  "/edit",
  userAuth,
  asyncHandler(async (req, res, next) => {
    const allowedFields = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "about",
      "skills",
      "photoURL",
    ];

    const isValidUpdate = Object.keys(req.body).every((field) =>
      allowedFields.includes(field),
    );

    if (!isValidUpdate) {
      return next(new AppError("Invalid edit request", 400));
    }

    const errors = validateUpdate(req.body);
    if (errors.length > 0) {
      return next(new AppError(errors.join(", "), 400));
    }

    const user = req.user;

    Object.keys(req.body).forEach((field) => {
      user[field] = req.body[field];
    });

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  }),
);

//Change Password

profileRouter.patch(
  "/password",
  userAuth,
  asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(
        new AppError("Current password and new password are required", 400),
      );
    }

    const user = await User.findById(req.user._id).select("+password");

    const isCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isCorrect) {
      return next(new AppError("Current password is incorrect", 400));
    }

    if (!validator.isStrongPassword(newPassword)) {
      return next(
        new AppError(
          "New password must include upper, lower, number and symbol",
          400,
        ),
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  }),
);

module.exports = profileRouter;
