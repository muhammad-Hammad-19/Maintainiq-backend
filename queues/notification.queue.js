// queues/notification.queue.js

import { Queue } from "bullmq";
import connection from "../config/radis.js";

const notificationQueue = new Queue("notification-queue", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export default notificationQueue;