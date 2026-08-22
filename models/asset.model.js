// models/asset.model.js

import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    qrId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "HVAC",
        "Elevator",
        "Electrical",
        "Plumbing",
        "Machinery",
        "Structural",
        "Other",
      ],
      default: "Other",
      required: true,
    },
    location: {
      building: { type: String, trim: true },
      floor: { type: String, trim: true },
      area: { type: String, trim: true },
    },
    model: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    installDate: {
      type: Date,
    },
    warrantyExpiry: {
      type: Date,
    },
    isCritical: {
      type: Boolean,
      default: false, // safety-critical assets ko AI priority scoring mein zyada weight milega
    },
    status: {
      type: String,
      enum: ["ACTIVE", "UNDER_MAINTENANCE", "DECOMMISSIONED"],
      default: "ACTIVE",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // extra flexible fields (industry-specific)
      default: {},
    },
  },
  { timestamps: true },
);

const Asset = mongoose.model("Asset", assetSchema);
export default Asset;
