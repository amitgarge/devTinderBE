const express = require("express");
const connectDB = require("./src/config/database");
const User = require("./src/models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cookieparser = require("cookie-parser");
const { userAuth } = require("./src/middlewares/auth");

const {
  validateSignup,
  validateUpdate,
} = require("./src/util/validators/user.validator");

const app = express();

app.use(express.json());
app.use(cookieparser());

app.post("/login", async (req, res) => {
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
      res.send("Login Successful");
    }
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

app.post("/signup", async (req, res) => {
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
    res.send("User Details Saved Successfully");
  } catch (err) {
    res.status(400).send("Error while saving the user details" + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(400).send("ERROR: " + error);
  }
});

app.post("/sendConnectionRequest", userAuth, (req, res) => {
  try {
    console.log("Sending connection request");
    res.send("Connection request sent by " + req.user.firstName);
  } catch (error) {
    req.status(400).send("ERROR: " + error.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connection succesful");
    app.listen(3000, () => {
      console.log("Server is running and listening on the port 3000");
    });
  })
  .catch(() => {
    console.error("Database cannot be connected!");
  });
