const express = require("express");
const { userAuth } = require("../middlewares/auth");

const requestsRouter = express.Router();

requestsRouter.post("/sendConnectionRequest", userAuth, (req, res) => {
  try {    
    res.send("Connection request sent by " + req.user.firstName);
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = requestsRouter;