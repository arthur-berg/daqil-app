import { qstashClient, scheduleTask } from "@/lib/qstash"; // Import necessary functions
import ScheduledTask from "@/models/ScheduledTask";

export const schedulePaymentReminders = async (
  appointmentId: string,
  clientEmail: string
) => {
  const now = new Date();
  const reminderTime = new Date(now.getTime() + 10 * 1000); // 1 minute from now

  const unixTimestampInSeconds = Math.floor(reminderTime.getTime() / 1000);
  const taskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-payment-reminder`,
    { appointmentId, clientEmail },
    unixTimestampInSeconds
  );

  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "paymentReminder",
    taskId,
  });
};

export const scheduleCancelUnpaidJobs = async (
  appointmentId: string,
  paymentExpiryDate: Date
) => {
  // Convert the paymentExpiryDate to Unix timestamp in seconds
  const unixTimestampInSeconds = Math.floor(paymentExpiryDate.getTime() / 1000);
  const now = new Date();

  const tenSecondsLater = new Date(now.getTime() + 10 * 1000); // 10 seconds from now
  const cancelUnpaidTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/cancel-unpaid`,
    { appointmentId: appointmentId },
    Math.floor(tenSecondsLater.getTime() / 1000)
  );
  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "cancelUnpaid",
    taskId: cancelUnpaidTaskId,
  });
};

// Function to schedule jobs related to an appointment for testing purposes
export const scheduleAppointmentJobs = async (appointmentId: any) => {
  // Populate participants field to get the user details

  const now = new Date();
  const tenSecondsLater = new Date(now.getTime() + 10 * 1000); // 10 seconds from now

  console.log("appointmentId", appointmentId);

  // Schedule status update job 10 seconds from now
  const statusUpdateTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/status-update`,
    { appointmentId: appointmentId },
    Math.floor(tenSecondsLater.getTime() / 1000)
  );

  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "statusUpdate",
    taskId: statusUpdateTaskId,
  });

  // Schedule email reminder job 10 seconds from now for each participant

  const emailReminderTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-email-reminder`,
    {
      appointmentId: appointmentId,
    },
    Math.floor(tenSecondsLater.getTime() / 1000)
  );

  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "emailReminder",
    taskId: emailReminderTaskId,
  });

  // Schedule SMS reminder job 10 seconds from now
  const smsReminderTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-sms-reminder`,
    {
      appointmentId: appointmentId,
    },
    Math.floor(tenSecondsLater.getTime() / 1000)
  );

  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "smsReminder",
    taskId: smsReminderTaskId,
  });
};

export const cancelAllScheduledJobsForAppointment = async (
  appointmentId: string
): Promise<void> => {
  try {
    // Fetch all scheduled tasks for this appointment
    const tasks = await ScheduledTask.find({ appointmentId });
    if (tasks.length === 0) {
      console.log(`No scheduled jobs found for appointment ${appointmentId}.`);
      return;
    }
    const taskIds = tasks.map((task) => task.taskId);

    await qstashClient.messages.deleteMany(taskIds);
    await ScheduledTask.deleteMany({
      taskId: { $in: taskIds },
    });
  } catch (error) {
    console.error(
      `Error cancelling all jobs for appointment ${appointmentId}:`,
      error
    );
  }
};

export const cancelPaymentRelatedJobsForAppointment = async (
  appointmentId: string
): Promise<void> => {
  try {
    // Fetch payment-related tasks for this appointment
    const tasks = await ScheduledTask.find({
      appointmentId,
      type: { $in: ["cancelUnpaid", "paymentReminder"] }, // Ensure 'paymentReminder' is used here
    });

    if (tasks.length === 0) {
      console.log(
        `No payment-related jobs found for appointment ${appointmentId}.`
      );
      return;
    }

    // Cancel each task and remove it from the collection
    const taskIds = tasks.map((task) => task.taskId);

    await qstashClient.messages.deleteMany(taskIds);
    await ScheduledTask.deleteMany({
      taskId: { $in: taskIds },
    });
  } catch (error) {
    console.error(
      `Error cancelling payment-related jobs for appointment ${appointmentId}:`,
      error
    );
  }
};
