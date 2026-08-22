// services/report.service.js

import Asset from "../models/asset.model.js";
import WorkOrder from "../models/workOrder.model.js";
import aiClassificationQueue from "../queues/aiClassification.queue.js";

export const createReportService = async (qrId, reportText) => {
  try {
    // 1. qrId se Asset find karo
    const asset = await Asset.findOne({ qrId });

    if (!asset) {
      return {
        success: false,
        message: "Asset not found for the given QR code",
      };
    }

    // 2. Naya WorkOrder create karo
    const workOrder = await WorkOrder.create({
      asset: asset._id,
      reporterType: "PUBLIC",
      reportText,
      status: "PENDING_TRIAGE",
    });

    await aiClassificationQueue.add("classify-report", {
      workOrderId: workOrder._id.toString(),
      reportText,
      assetContext: {
        name: asset.name,
        category: asset.category,
        isCritical: asset.isCritical,
      },
    });

    // 3. Success response
    return {
      success: true,
      message: "Report submitted successfully",
      data: workOrder,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
