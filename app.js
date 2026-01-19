const express = require("express");
const connectDB = require("./src/config/database");
const User = require("./src/models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");
var cookieparser = require("cookie-parser");

const {
  validateSignup,
  validateUpdate,
} = require("./src/util/validators/user.validator");

const app = express();

app.use(express.json());
app.use(cookieparser());

app.get("/user", async (req, res) => {
  try {
    const users = await User.find({ email: req.body.email });
    if (users.length === 0) {
      res.status(404).send("User Not Found!");
    } else {
      res.send(users);
    }
  } catch (errr) {
    res.status(400).send("Something went Wrong");
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(400).send("Something went wrong!");
  }
});

app.delete("/user", async (req, res) => {
  try {
    const name = req.body.firstName;
    await User.deleteOne({ firstName: name });
    res.send("User Deleted Succssfully");
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!validator.isEmail(email)) {
      throw new Error("Enter a valid email ID");
    }

    const user = await User.findOne({email});
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error("Invalid Credentials");
    } else {
      res.cookie("token", "ahsdfjkhakjsdfhkjafasdfasdfasdf")
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

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  const ALLOWED_UPDATES = ["photoURL", "about", "gender", "age", "skills"];

  const isUpdateAllowed = Object.keys(data).every((key) =>
    ALLOWED_UPDATES.includes(key)
  );

  if (!isUpdateAllowed) {
    throw new Error("Update not allowed!");
  }

  const errors = validateUpdate(data);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await User.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send("User updated successfully.");
  } catch (err) {
    res.status(400).send("Update Failed: " + err.message);
  }
});

app.get("/profile", (req,res)=>{
  const cookies = req.cookies;
  console.log(cookies);
  res.send("Inside Profile");
})

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
