import dotenv from "dotenv";
dotenv.config();
import assetRoutes from "./routes/assetRoutes.js";
import express from "express";
import cors from "cors";
import { connectDB } from "./db/db.js";
import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import reportRoutes from "./routes/reportRoutes.js";
import connection from "./config/radis.js";
import { initSocketServer } from "./socket/socket.server.js";

import workOrderRoutes from "./routes/workOrderRoutes.js";

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5000;

app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());

initSocketServer(server);

app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRouter);
app.use("/api/workorders", workOrderRoutes);
app.use("/api/assets", assetRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
