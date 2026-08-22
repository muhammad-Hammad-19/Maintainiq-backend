// routes/asset.routes.js

import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import requireRole from "../middlewares/rbacMiddleware.js";
import {
  createAsset,
  getAllAssets,
  getAssetByQrId,
  updateAsset,
  deleteAsset,
} from "../controllers/assetController.js";

const router = express.Router();

// Admin only
router.post("/", authMiddleware, requireRole("ADMIN"), createAsset);
router.get("/", authMiddleware, requireRole("ADMIN"), getAllAssets);
router.patch("/:id", authMiddleware, requireRole("ADMIN"), updateAsset);
router.delete("/:id", authMiddleware, requireRole("ADMIN"), deleteAsset);

// Public — no auth (QR scan se aayega)
router.get("/:qrId", getAssetByQrId);

export default router;
