const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

const requestsRouter = express.Router();

requestsRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];

      if (!allowedStatus.includes(req.params.status)) {
        res.status(400).send("Invalid Status");
      }

      const toUser = await User.findOne(req.params.toUserId);
      if (!toUser) {
        res.status(400).send("User does not exist!");
      }

      const loggedInuser = req.user;

      const connectionRequestData = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequestData.save();

      res.send({
        message: `Connection request sent successfully`,
        data,
      });
    } catch (error) {
      res.status(400).send("ERROR: " + error.message);
    }
  },
);

module.exports = requestsRouter;
