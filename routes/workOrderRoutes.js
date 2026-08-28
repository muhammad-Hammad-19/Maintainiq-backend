// routes/workOrder.routes.js

import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import requireRole from "../middlewares/rbacMiddleware.js";
import {
  getOpenWorkOrders,
  assignWorkOrder,
  getMyJobs,
  updateWorkOrderStatus,
} from "../controllers/workOrder.controller.js";

const router = express.Router();

// Admin only — list work orders (default: OPEN, filterable via ?status=)
router.get("/", authMiddleware, requireRole("ADMIN"), getOpenWorkOrders);

// Admin only — assign technician to a work order
router.patch(
  "/:id/assign",
  authMiddleware,
  requireRole("ADMIN"),
  assignWorkOrder,
);

router.get("/my-jobs", authMiddleware, requireRole("TECHNICIAN"), getMyJobs);
router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("TECHNICIAN"),
  updateWorkOrderStatus,
);

export default router;
