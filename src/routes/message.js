const express = require("express");
const router = express.Router();

const Message = require("../models/message");
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middlewares/auth");

router.get("/:targetUserId", userAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const { targetUserId } = req.params;

    const { cursor, limit } = req.query;

    const connection = await ConnectionRequest.findOne({
      $or: [
        {
          fromUserId: currentUserId,
          toUserId: targetUserId,
          status: "accepted",
        },
        {
          fromUserId: targetUserId,
          toUserId: currentUserId,
          status: "accepted",
        },
      ],
    });

    if (!connection) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const query = {
      $or: [
        {
          senderId: currentUserId,
          targetUserId,
        },
        {
          senderId: targetUserId,
          targetUserId: currentUserId,
        },
      ],
    };

    //pagination condition
    if (cursor) {
      query.createdAt = {
        $lt: new Date(cursor),
      };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      data: messages.reverse(), // send oldest → newest
      nextCursor:
        messages.length > 0 ? messages[messages.length - 1].createdAt : null,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
