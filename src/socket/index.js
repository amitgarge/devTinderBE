const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Message = require("../models/message");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

function generateRoomId(user1, user2) {
  const sorted = [user1, user2].sort().join("_");

  return crypto.createHash("sha256").update(sorted).digest("hex");
}

let io;

//Store Online Users
const onlineUsers = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  //Auth
  io.use((socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;

      if (!cookies) {
        return next(new Error("No cookies found!"));
      }

      const parsedCookies = cookie.parse(cookies);
      const token = parsedCookies.token;

      if (!token) {
        return next(new Error("No Error Found!"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded._id;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connect", (socket) => {
    const userId = socket.userId;
    console.log("User connected:", socket.userId, "| socket:", socket.id);
    //save socket <-> user mapping
    onlineUsers.set(userId, socket.id);

    socket.on("get_online_users", () => {
      socket.emit("online_users", Array.from(onlineUsers.keys()));
    });

    // notify others
    socket.broadcast.emit("user_online", { userId });

    //JOIN ROOM EVENT

    socket.on("join_room", async (data) => {
      if (!data || !data.targetUserId) {
        console.log("join_room called without targetUserId");
        return;
      }
      const { targetUserId } = data;
      const currentUserId = socket.userId;

      // CHECK IF CONNECTION EXISTS
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
        socket.emit("error", "Not authorized to chat");

        return;
      }

      //create unique room Id
      const roomId = generateRoomId(socket.userId, targetUserId);

      socket.join(roomId);

      console.log(`User ${currentUserId} joined room ${roomId}`);
    });

    socket.on("send_message", async (data) => {
      try {
        const { targetUserId, text } = data;

        if (!targetUserId || !text) return;

        const senderId = socket.userId;

        // CHECK IF CONNECTION EXISTS
        const connection = await ConnectionRequest.findOne({
          $or: [
            {
              fromUserId: senderId,
              toUserId: targetUserId,
              status: "accepted",
            },

            {
              fromUserId: targetUserId,
              toUserId: senderId,
              status: "accepted",
            },
          ],
        });

        if (!connection) {
          socket.emit("error", "Not authorized to chat");

          return;
        }

        const roomId = generateRoomId(senderId, targetUserId);

        // SAVE TO DATABASE
        const newMessage = await Message.create({
          senderId,
          targetUserId,
          text,
        });

        // emit saved message
        io.to(roomId).emit("receive_message", newMessage);
      } catch (error) {
        console.error("Send message error:", error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        if (!socket.userId) return;

        const userId = socket.userId;

        console.log("User disconnected:", userId, "| socket:", socket.id);

        // Remove from online users map
        onlineUsers.delete(userId);

        const lastSeen = new Date();

        // Update DB
        await User.findByIdAndUpdate(userId, {
          lastSeen,
        });

        // Notify others
        socket.broadcast.emit("user_offline", {
          userId,
          lastSeen,
        });
      } catch (err) {
        console.error("Disconnect error:", err);
      }
    });

    socket.on("typing", ({ targetUserId }) => {
      const roomId = generateRoomId(socket.userId, targetUserId);

      socket.to(roomId).emit("user_typing", {
        userId: socket.userId,
      });
    });
    socket.on("stop_typing", ({ targetUserId }) => {
      const roomId = generateRoomId(socket.userId, targetUserId);

      socket.to(roomId).emit("user_stop_typing");
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};

const getReceiverSocketId = (userId) => {
  return onlineUsers.get(userId);
};

const isUserOnline = (userId) => onlineUsers.has(userId);

module.exports = {
  initSocket,
  getIO,
  getReceiverSocketId,
  isUserOnline,
};
