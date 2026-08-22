// models/workOrder.model.js

import mongoose from "mongoose";

const workOrderSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    reporterType: {
      type: String,
      enum: ["PUBLIC", "TECHNICIAN", "ADMIN"],
      default: "PUBLIC",
      required: true,
    },
    reportText: {
      type: String,
      required: true,
      trim: true,
    },
    aiClassification: {
      category: { type: String },
      priority: { type: Number, min: 1, max: 5 },
      summary: { type: String },
      suggestedCause: { type: String },
    },
    status: {
      type: String,
      enum: ["PENDING_TRIAGE", "OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED"],
      default: "PENDING_TRIAGE",
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    attachments: [
      {
        type: String, // S3 URLs
      },
    ],
  },
  { timestamps: true },
);

const WorkOrder = mongoose.model("WorkOrder", workOrderSchema);
export default WorkOrder;
