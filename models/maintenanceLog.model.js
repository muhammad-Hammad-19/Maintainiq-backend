// models/maintenanceLog.model.js

import mongoose from "mongoose";

const maintenanceLogSchema = new mongoose.Schema(
  {
    workOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkOrder",
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      // e.g. "Status changed to IN_PROGRESS", "Status changed to RESOLVED"
    },
    statusAtLog: {
      type: String,
      enum: ["PENDING_TRIAGE", "OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED"],
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        type: String, // S3 URLs
      },
    ],
  },
  { timestamps: true }
);

const MaintenanceLog = mongoose.model("MaintenanceLog", maintenanceLogSchema);
export default MaintenanceLog;