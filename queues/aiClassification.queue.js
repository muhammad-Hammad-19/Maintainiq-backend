// queues/aiClassification.queue.js

import { Queue } from "bullmq";
import connection from "../config/radis.js";

const aiClassificationQueue = new Queue("ai-classification-queue", {
  connection,
  defaultJobOptions: {
    attempts: 3, // agar AI call fail ho, 3 baar retry karega
    backoff: {
      type: "exponential",
      delay: 5000, // pehli retry 5s baad, phir 10s, phir 20s
    },
    removeOnComplete: 100, // sirf latest 100 completed jobs history mein rakho
    removeOnFail: 500, // failed jobs zyada dair store karo debugging ke liye
  },
});

export default aiClassificationQueue;
