const express = require("express");
const { userAuth } = require("../middlewares/auth");
const asyncHandler = require("../util/asyncHandler");
const AppError = require("../util/AppError");

const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

const requestsRouter = express.Router();

//Send Connection Request

requestsRouter.post(
  "/send/:status/:toUserId",
  userAuth,
  asyncHandler(async (req, res, next) => {
    const fromUserId = req.user._id;
    const { toUserId, status } = req.params;

    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    if (fromUserId.toString() === toUserId) {
      return next(new AppError("You cannot send request to yourself", 400));
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return next(new AppError("User does not exist", 404));
    }

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingRequest) {
      return next(new AppError("Connection already exists", 400));
    }

    const connectionRequest = await ConnectionRequest.create({
      fromUserId,
      toUserId,
      status,
    });

    res.status(201).json({
      success: true,
      message:
        status === "interested"
          ? "Connection request sent successfully"
          : "Connection request ignored successfully",
      data: connectionRequest,
    });
  }),
);

//Review Connection Request
requestsRouter.post(
  "/review/:status/:requestId",
  userAuth,
  asyncHandler(async (req, res, next) => {
    const { status, requestId } = req.params;

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    const requestDoc = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: req.user._id,
      status: "interested",
    });

    if (!requestDoc) {
      return next(new AppError("Request not found", 404));
    }

    requestDoc.status = status;
    await requestDoc.save();

    res.status(200).json({
      success: true,
      message: `Connection request ${status} successfully`,
      data: requestDoc,
    });
  }),
);

module.exports = requestsRouter;
