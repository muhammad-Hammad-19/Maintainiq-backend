// services/workOrder.service.js

import WorkOrder from "../models/workOrder.model.js";
// services/workOrder.service.js (existing file mein add karein)

import mongoose from "mongoose";
import MaintenanceLog from "../models/maintenanceLog.model.js";
import { getIO } from "../socket/socket.server.js";

export const getMyJobsService = async (technicianId) => {
  try {
    const workOrders = await WorkOrder.find({
      assignedTechnician: technicianId,
    })
      .populate("asset")
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: "Work orders fetched successfully",
      data: workOrders,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

const ALLOWED_TECHNICIAN_STATUSES = ["IN_PROGRESS", "RESOLVED"];

export const updateWorkOrderStatusService = async (
  workOrderId,
  technicianId,
  { status, notes, attachments },
) => {
  try {
    // 1. Validate id
    if (!mongoose.Types.ObjectId.isValid(workOrderId)) {
      return { success: false, message: "Invalid work order id" };
    }

    // 2. Validate status value
    if (!ALLOWED_TECHNICIAN_STATUSES.includes(status)) {
      return {
        success: false,
        message: `Status must be one of: ${ALLOWED_TECHNICIAN_STATUSES.join(", ")}`,
      };
    }

    // 3. Fetch the work order first — ownership check ke liye
    const workOrder = await WorkOrder.findById(workOrderId);

    if (!workOrder) {
      return { success: false, message: "Work order not found" };
    }

    // 4. Ownership check — yeh ticket isi technician ko assigned hai?
    if (
      !workOrder.assignedTechnician ||
      workOrder.assignedTechnician.toString() !== technicianId.toString()
    ) {
      return {
        success: false,
        message: "This work order is not assigned to you",
      };
    }

    // 5. Update work order status
    workOrder.status = status;
    await workOrder.save();

    // 6. Insert MaintenanceLog entry (append-only history)
    await MaintenanceLog.create({
      workOrder: workOrderId,
      technician: technicianId,
      action: `Status changed to ${status}`,
      statusAtLog: status,
      notes,
      attachments,
    });

    const updatedWorkOrder = await WorkOrder.findById(workOrderId)
      .populate("asset")
      .populate("assignedTechnician");

    // 7. Socket emit — Admin dashboard ko live update
    try {
      const io = getIO();
      io.to("admin-room").emit("status:update", updatedWorkOrder);
    } catch (socketError) {
      console.error("Socket emit failed:", socketError.message);
    }

    return {
      success: true,
      message: "Work order status updated successfully",
      data: updatedWorkOrder,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
