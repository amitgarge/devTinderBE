const express = require("express");
const connectDB = require("./src/config/database")
const User = require("./src/models/user")
const app = express();

app.post("/signup", async (req, res) => {

  const user = new User({
    firstName: "Virat",
    lastName: "Kohli",
    email: "virat.kohli@gmail.com",
    password: "viratt@123",
    age: "45",
    gender: "Male"
  });
  try {
    await user.save();
    res.send("User Details Saved Successfully")
  } catch (err) {
    res.status(400).send("Error while saving the user details");
  }
});

connectDB().then(() => {
  console.log("Database connection succesful")
  app.listen(3000, () => {
    console.log("Server is running and listening on the port 3000");
  });
}).catch(() => {
  console.error("Database cannot be connected!")
})
