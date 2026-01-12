const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },
    gender: {
      type: String,
      lowercase: true,
      enum: ["male", "female", "others"],
      required: true,
    },
    about: {
      type: String,
      maxlength: 500,
      default: "This is default about details of the user.",
    },
    skills: {
      type: [String],
      validate: {
        validator: (v) => v.length > 0,
        message: "Skills array cannot be empty",
      },
    },
    photoURL: {
      type: String,
      match: /^https?:\/\//,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
