const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
      default: "https://www.citypng.com/public/uploads/preview/hd-man-user-illustration-icon-transparent-png-701751694974843ybexneueic.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Enter a valid URL");
        }
      },
    },
  },
  { timestamps: true },
);

userSchema.methods.getJWT = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, "DevTinder@123", {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.passwordCompare = async function (passwordInputFromUser) {
  const user = this;
  const isPasswordCorrect = await bcrypt.compare(
    passwordInputFromUser,
    user.password,
  );
  return isPasswordCorrect;
};
module.exports = mongoose.model("User", userSchema);
