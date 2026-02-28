const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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

    //JOIN ROOM EVENT

    socket.on("join_room", (data) => {
      if (!data || !data.targetUserId) {
        console.log("join_room called without targetUserId");
        return;
      }
      const { targetUserId } = data;
      const currentUserId = socket.userId;

      //create unique room Id
      const roomId = generateRoomId(socket.userId, targetUserId);

      socket.join(roomId);

      console.log(`User ${currentUserId} joined room ${roomId}`);
    });

    socket.on("send_message", (data) => {
      try {
        const { targetUserId, text } = data;

        if (!targetUserId || !text) {
          return;
        }

        const senderId = socket.userId;

        const roomId = generateRoomId(senderId, targetUserId);

        const messagePayload = {
          senderId,
          targetUserId,
          text,
          createdAt: new Date(),
        };

        //emit to everyone in the room
        io.to(roomId).emit("receive_message", messagePayload);

        console.log("Message sent: ", messagePayload);
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId, "| socket:", socket.id);
      onlineUsers.delete(userId);
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

module.exports = {
  initSocket,
  getIO,
  getReceiverSocketId,
};
