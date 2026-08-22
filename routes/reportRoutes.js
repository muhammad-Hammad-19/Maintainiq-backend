// routes/report.routes.js

import express from "express";
import rateLimit from "express-rate-limit";
import { createReport } from "../controllers/reportController.js";

const router = express.Router();

// Spam/DDoS protection — public endpoint hai, isliye zaroori hai

const reportLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // per IP max 5 requests
  message: {
    success: false,
    message: "Too many reports submitted. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public route — no auth (QR scan se aayega)

router.post("/", reportLimiter, createReport);

export default router;
