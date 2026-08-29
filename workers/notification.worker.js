// workers/notification.worker.js

import { Worker } from "bullmq";
import connection from "../config/radis.js";
import { sendEmail } from "../services/email.service.js";

const notificationWorker = new Worker(
  "notification-queue",
  async (job) => {
    const { to, subject, html } = job.data;

    const result = await sendEmail({ to, subject, html });

    if (!result.success) {
      throw new Error(result.message); // BullMQ retry trigger karega
    }

    return result;
  },
  {
    connection,
    concurrency: 5,
  }
);

notificationWorker.on("completed", (job) => {
  console.log(`✅ Notification email sent for job ${job.id}`);
});

notificationWorker.on("failed", (job, err) => {
  console.error(`❌ Notification failed for job ${job?.id}:`, err.message);
});

export default notificationWorker;