const mongoose = require("mongoose");
const validator = require("validator");

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
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email ID.");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong passoword.");
        }
      },
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 75,
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
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Enter a valid URL");
        }
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
