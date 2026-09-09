// services/report.service.js

import Asset from "../models/asset.model.js";
import WorkOrder from "../models/workOrder.model.js";
import aiClassificationQueue from "../queues/aiClassification.queue.js";
export const createReportService = async (qrId, reportText) => {
  try {
    const asset = await Asset.findOne({ qrId });

    if (!asset) {
      return {
        success: false,
        message: "Asset not found for the given QR code",
      };
    }

    const workOrder = await WorkOrder.create({
      asset: asset._id,
      reporterType: "PUBLIC",
      reportText,
      status: "PENDING_TRIAGE",
    });

    console.log("Step 1: WorkOrder created:", workOrder._id); // ⚠️ NAYA

    const job = await aiClassificationQueue.add("classify-report", {
      workOrderId: workOrder._id.toString(),
      reportText,
      assetContext: {
        name: asset.name,
        category: asset.category,
        isCritical: asset.isCritical,
      },
    });

    console.log("Step 2: Job added, ID:", job?.id); // ⚠️ NAYA

    return {
      success: true,
      message: "Report submitted successfully",
      data: workOrder,
    };
  } catch (error) {
    console.error("❌ createReportService ERROR:", error.message); // ⚠️ NAYA — yeh sabse zaroori hai
    console.error(error); // ⚠️ NAYA — poori stack trace
    return {
      success: false,
      message: error.message,
    };
  }
};