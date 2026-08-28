// socket/socket.server.js

import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // ⚠️ Middleware — har connection JWT verify hoga (before allowing connect)
  
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.cookie
          ?.split("; ")
          .find((c) => c.startsWith("token="))
          ?.split("=")[1];

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { _id, email, role, name }
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const { _id, role } = socket.user;

    console.log(`✅ Socket connected: ${socket.user.name} (${role})`);

    // Room assignment based on role
    if (role === "ADMIN") {
      socket.join("admin-room");
    } else if (role === "TECHNICIAN") {
      socket.join(`technician:${_id}`);
    }

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

// Kisi bhi file se io instance access karne ke liye
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized yet");
  }
  return io;
};