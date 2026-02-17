const express = require("express");
const { userAuth } = require("../middlewares/auth");
const asyncHandler = require("../util/asyncHandler");

const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName age gender about skills photoURL";

//Received Requests

userRouter.get(
  "/requests/received",
  userAuth,
  asyncHandler(async (req, res) => {
    const pendingRequests = await ConnectionRequest.find({
      toUserId: req.user._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.status(200).json({
      success: true,
      message: "Pending requests fetched successfully",
      data: pendingRequests,
    });
  }),
);


//Connections
userRouter.get(
  "/connections",
  userAuth,
  asyncHandler(async (req, res) => {
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: req.user._id, status: "accepted" },
        { toUserId: req.user._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const result = connections.map((row) =>
      row.fromUserId._id.toString() === req.user._id.toString()
        ? row.toUserId
        : row.fromUserId,
    );

    res.status(200).json({
      success: true,
      message: "Connections fetched successfully",
      data: result,
    });
  }),
);

//Feed

userRouter.get(
  "/feed",
  userAuth,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }],
    }).select("fromUserId toUserId");

    const hideFromFeed = new Set();

    connectionRequests.forEach((reqDoc) => {
      hideFromFeed.add(reqDoc.fromUserId.toString());
      hideFromFeed.add(reqDoc.toUserId.toString());
    });

    const users = await User.find({
      _id: {
        $nin: [...hideFromFeed, req.user._id.toString()],
      },
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Feed fetched successfully",
      data: users,
    });
  }),
);

module.exports = userRouter;
