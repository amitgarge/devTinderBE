const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "accepted", "rejected", "interested"],
        message: "{VALUE} is not a valid status",
      },
      required: true,
    },
  },
  { timestamps: true },
);

//Prevent Duplication Same Direction

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionRequestSchema.pre("save", async function () {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("You cannot send a request to yourself");
  }

  const reverse = await mongoose.model("ConnectionRequest").findOne({
    fromUserId: this.toUserId,
    toUserId: this.fromUserId,
  });

  if (reverse) {
    throw new Error("Connection already exists between these users");
  }
});

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);

module.exports = ConnectionRequest;
