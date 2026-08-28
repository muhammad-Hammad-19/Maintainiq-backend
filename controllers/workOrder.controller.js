// controllers/workOrder.controller.js

import { getMyJobsService } from "../services/workOrder.service.js";
import {
  updateWorkOrderStatusService,
} from "../services/workOrder.service.js";
import WorkOrder from "../models/workOrder.model.js";

export const getOpenWorkOrders = async (req, res) => {
  try {
    const status = req.query.status || "OPEN";

    const workOrders = await WorkOrder.find({ status })
      .populate("asset")
      .populate("assignedTechnician")
      .sort({ "aiClassification.priority": -1 });

    return res.status(200).json({
      success: true,
      message: "Work orders fetched successfully",
      data: workOrders,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const assignWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;

    // 1. Basic validation
    if (!technicianId) {
      return res.status(400).json({
        success: false,
        message: "technicianId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid work order id",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(technicianId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid technician id",
      });
    }

    // 2. Confirm technicianId actually belongs to a TECHNICIAN
    const technician = await User.findOne({
      _id: technicianId,
      role: "TECHNICIAN",
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

    // 3. Update the work order
    const updatedWorkOrder = await WorkOrder.findByIdAndUpdate(
      id,
      {
        status: "ASSIGNED",
        assignedTechnician: technicianId,
      },
      { new: true },
    )
      .populate("asset")
      .populate("assignedTechnician");

    if (!updatedWorkOrder) {
      return res.status(404).json({
        success: false,
        message: "Work order not found",
      });
    }

    // 4. Emit real-time event to the assigned technician's room
    try {
      const io = getIO();
      io.to(`technician:${technicianId}`).emit(
        "dispatch:new",
        updatedWorkOrder,
      );
    } catch (socketError) {
      console.error("Socket emit failed:", socketError.message);
      // Emit fail hone se pura request fail nahi hona chahiye — DB update to ho chuka hai
    }

    // 5. Send response
    return res.status(200).json({
      success: true,
      message: "Work order assigned successfully",
      data: updatedWorkOrder,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// controllers/workOrder.controller.js


export const getMyJobs = async (req, res) => {
  try {
    const technicianId = req.user._id;

    const result = await getMyJobsService(technicianId);

    if (!result.success) {
      return res.status(400).json({
        success: result.success,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// controllers/workOrder.controller.js (existing file mein add karein)

export const updateWorkOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const technicianId = req.user._id;
    const { status, notes, attachments } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    const result = await updateWorkOrderStatusService(id, technicianId, {
      status,
      notes,
      attachments,
    });

    if (!result.success) {
      return res.status(400).json({
        success: result.success,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
