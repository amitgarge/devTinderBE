const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const mongoose = require("mongoose");

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

      if (!allowedStatus.includes(status)) {
        return res.status(400).send("Invalid Status");
      }

      const toUser = await User.findOne({ _id: toUserId });
      if (!toUser) {
        return res.status(400).send("User does not exist!");
      }

      const isRequestAlreadyExists = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (isRequestAlreadyExists) {
        return res.status(400).send("Connection already exists!");
      }

      const loggedInuser = req.user;

      const connectionRequestData = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequestData.save();

      return res.json({
        message:
          status === "interested"
            ? "Connection Request Sent Successfully"
            : "Connection Request Ignored Successfully",
        data,
      });
    } catch (error) {
      return res.status(400).send("ERROR: " + error.message);
    }
  },
);

requestsRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {      

      const loggedInUser = req.user;
      const { status, requestId } = req.params;      

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {        
        return res.status(400).send({ message: "Invalid status" });
      }

      const validateRequestDetails = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!validateRequestDetails) {
        return res.status(404).send({ message: "Request not found" });
      }
      validateRequestDetails.status = status;
      const data = await validateRequestDetails.save();

      res.json({
        message: "Connection request " + status + " successfully!",
        data,
      });
    } catch (error) {
      return res.status(400).send("ERROR: " + error.message);
    }
  },
);

module.exports = requestsRouter;
