const express = require("express");
const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignup } = require("../util/validators/user.validator");

const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!validator.isEmail(email)) {
      throw new Error("Enter a valid email ID");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordCorrect = await user.passwordCompare(password);
    if (!isPasswordCorrect) {
      throw new Error("Invalid Credentials");
    } else {
      const token = await user.getJWT();
      res.cookie("token", token, { maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ message: "Login Successful", data: user });
    }
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

authRouter.post("/signup", async (req, res) => {
  //Validate the data
  const errors = validateSignup(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  try {
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

    //Encrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
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

    await user.save();
    res.json({ message: "User Details Saved Successfully" });
  } catch (err) {
    return res
      .status(400)
      .send({ message: "Error while saving the user details" + err.message });
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  return res.send({ message: "Logged out successfully!" });
});

module.exports = authRouter;
