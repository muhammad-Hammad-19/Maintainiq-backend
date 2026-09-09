// workers/aiClassification.worker.js

import { Worker } from "bullmq";
import connection from "../config/radis.js";
import WorkOrder from "../models/workOrder.model.js";
import { classifyReport } from "../services/aiProviderService.js";
import { getIO } from "../socket/socket.server.js";

const aiClassificationWorker = new Worker(
  "ai-classification-queue",
  async (job) => {
    const { workOrderId, reportText, assetContext } = job.data;

    const aiResult = await classifyReport(reportText, assetContext);

    const updatedWorkOrder = await WorkOrder.findByIdAndUpdate(
      workOrderId,
      {
        aiClassification: aiResult,
        status: "OPEN",
      },
      { new: true }
    ).populate("asset");

    if (!updatedWorkOrder) {
      throw new Error("WorkOrder not found for classification update");
    }

    try {
      const io = getIO();
      io.to("admin-room").emit("ticket:created", updatedWorkOrder);
    } catch (socketError) {
      console.error("Socket emit failed:", socketError.message);
    }

    return updatedWorkOrder;
  },
  {
    connection,
    concurrency: 5,
  }
);

aiClassificationWorker.on("completed", (job) => {
  console.log(`✅ AI classification completed for job ${job.id}`);
});

aiClassificationWorker.on("failed", (job, err) => {
  console.error(`❌ AI classification failed for job ${job?.id}:`, err.message);
});

export default aiClassificationWorker;