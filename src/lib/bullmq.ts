import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import {
  checkAndUpdateAppointmentStatuses,
  checkAndCancelUnpaidAppointments,
} from "@/lib/cron-jobs";

// Set up Redis connection
const connection = new IORedis({
  host: "your-redis-endpoint", // Replace with your Redis endpoint
  port: 12345, // Replace with your Redis port
  password: "your-redis-password", // Replace with your Redis password
  tls: {}, // Enable TLS if required
});

// Create queues
const statusUpdateQueue = new Queue("statusUpdateQueue", { connection });
const cancelUnpaidQueue = new Queue("cancelUnpaidQueue", { connection });

// Function to schedule a job dynamically
export const scheduleJob = async (queue, jobName, data, delay) => {
  await queue.add(jobName, data, { delay });
};

// Create a worker to process status update jobs
const statusUpdateWorker = new Worker(
  "statusUpdateQueue",
  async (job) => {
    if (job.name === "updateAppointmentStatus") {
      await checkAndUpdateAppointmentStatuses();
    }
  },
  { connection }
);

// Create a worker to process cancel unpaid jobs
const cancelUnpaidWorker = new Worker(
  "cancelUnpaidQueue",
  async (job) => {
    if (job.name === "cancelUnpaidAppointments") {
      await checkAndCancelUnpaidAppointments();
    }
  },
  { connection }
);

// Handle job completion and failure events
statusUpdateWorker.on("completed", (job) =>
  console.log(`Job ${job.id} completed successfully.`)
);
statusUpdateWorker.on("failed", (job, err) =>
  console.error(`Job ${job.id} failed: ${err.message}`)
);
cancelUnpaidWorker.on("completed", (job) =>
  console.log(`Job ${job.id} completed successfully.`)
);
cancelUnpaidWorker.on("failed", (job, err) =>
  console.error(`Job ${job.id} failed: ${err.message}`)
);

// Export queues for use in other parts of the application
export { statusUpdateQueue, cancelUnpaidQueue };
