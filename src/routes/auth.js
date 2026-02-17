const express = require("express");
const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignup } = require("../util/validators/user.validator");
const AppError = require("../middlewares/errorHandler");
const asyncHandler = require("../util/asyncHandler");

const authRouter = express.Router();

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) {
      return next(new AppError("Enter a valid email ID", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new AppError("Invalid credentials", 401));
    }

    const isPasswordCorrect = await user.passwordCompare(password);
    if (!isPasswordCorrect) {
      return next(new AppError("Invalid credentials", 401));
    } else {
      const token = await user.getJWT();
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
        secure: false,
      });
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: user,
      });
    }
  }),
);

authRouter.post(
  "/signup",
  asyncHandler(async (req, res, next) => {
    const errors = validateSignup(req.body);

    if (errors.length > 0) {
      return next(new AppError(errors.join(", "), 400));
    }

    const {
      firstName,
      lastName,
      email,
      password,
      age,
      gender,
      about,
      skills,
      photoURL,
    } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: passwordHash,
      age,
      gender,
      about,
      skills,
      photoURL,
    });

    const token = await user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  }),
);

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});


module.exports = authRouter;
