const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    if (!req.cookies) {
      throw new Error("Invalid cookies");
    }
        
    const { token } = req.cookies || {};
    if (!token) return res.status(401).send("ERROR: Missing token");

    const decodedObj = jwt.verify(token, "DevTinder@123");
    if (!decodedObj) {
      throw new Error("Invalid token");
    }

    const { _id } = decodedObj;

    const user = await User.findById(_id);

    if (!user) {
      throw new Error("User Not found");
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(400).send("ERROR: " + err.message);
  }
};

module.exports = { userAuth };
