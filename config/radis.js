// config/redis.js

import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.REDIS_HOST || !process.env.REDIS_PASSWORD) {
  console.error("❌ Redis env variables missing! Check your .env file.");
}

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // ⚠️ BullMQ ke liye zaroori hai
});

connection.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

connection.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
});

export default connection;
