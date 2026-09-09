// services/workOrder.service.js

import WorkOrder from "../models/workOrder.model.js";

import notificationQueue from "../queues/notification.queue.js";

import mongoose from "mongoose";

import MaintenanceLog from "../models/maintenanceLog.model.js";


// services/user.service.js

import User from "../models/user.model.js";
import { getIO } from "../socket/socket.server.js";


export const getTechniciansService = async () => {
  try {
    const technicians = await User.find({
      role: "TECHNICIAN",
      status: "ACTIVE",
    }).select("name email status");

    // Har technician ke liye current open workload count nikalna
    const techniciansWithWorkload = await Promise.all(
      technicians.map(async (tech) => {
        const openJobsCount = await WorkOrder.countDocuments({
          assignedTechnician: tech._id,
          status: { $in: ["ASSIGNED", "IN_PROGRESS"] },
        });

        return {
          _id: tech._id,
          name: tech.name,
          email: tech.email,
          status: tech.status,
          openJobsCount,
        };
      }),
    );

    // Sabse kam workload wale upar (Admin ke liye helpful sorting)
    techniciansWithWorkload.sort((a, b) => a.openJobsCount - b.openJobsCount);

    return {
      success: true,
      message: "Technicians fetched successfully",
      data: techniciansWithWorkload,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
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

    // 4. Ownership check
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

    // ⚠️⚠️⚠️ YAHAN NAYA BLOCK — Notification trigger (sirf RESOLVED pe)
    if (status === "RESOLVED") {
      try {
        await notificationQueue.add("send-closure-email", {
          to: "mh03212868@gmail.com", // baad mein reporter ka email bhi ho sakta hai
          subject: "Maintenance Ticket Resolved",
          html: `
            <h2>Ticket Resolved</h2>
            <p><strong>Asset:</strong> ${updatedWorkOrder.asset?.name}</p>
            <p><strong>Category:</strong> ${updatedWorkOrder.aiClassification?.category || "N/A"}</p>
            <p><strong>Resolution Notes:</strong> ${notes || "N/A"}</p>
            <p><strong>Resolved By:</strong> ${updatedWorkOrder.assignedTechnician?.name}</p>
          `,
        });
      } catch (queueError) {
        console.error("Notification queue push failed:", queueError.message);
        // ⚠️ Yahan error throw nahi karna — email fail hone se status update fail nahi hona chahiye
      }
    }
    // ⚠️⚠️⚠️ NAYA BLOCK KHATAM

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
