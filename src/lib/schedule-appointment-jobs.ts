import { qstashClient, scheduleTask } from "@/lib/qstash"; // Import necessary functions
import ScheduledTask from "@/models/ScheduledTask";
import { addMinutes, isAfter, subDays, subHours, subMinutes } from "date-fns";

export const schedulePaymentReminders = async (
  appointmentId: string,
  paymentExpiryDate: Date
): Promise<void> => {
  const now = new Date();

  // Calculate reminder times
  const reminderTimes = [
    subDays(paymentExpiryDate, 24), // 24 hours before
    subHours(paymentExpiryDate, 6), // 6 hours before
    subHours(paymentExpiryDate, 2), // 2 hours before
  ];

  // Filter out reminder times that are in the past
  const validReminderTimes = reminderTimes.filter((reminderTime) =>
    isAfter(reminderTime, now)
  );

  // Create an array of promises for scheduling tasks
  const taskPromises = validReminderTimes.map(async (reminderTime) => {
    const unixTimestampInSeconds = Math.floor(reminderTime.getTime() / 1000);
    const taskId: string = await scheduleTask(
      `${process.env.QSTASH_API_URL}/send-payment-reminder`,
      { appointmentId },
      unixTimestampInSeconds
    );

    await ScheduledTask.create({
      appointmentId: appointmentId,
      type: "paymentReminder",
      taskId,
    });
  });

  // Wait for all scheduling tasks to complete
  await Promise.all(taskPromises);
};

export const scheduleRemoveUnpaidJobs = async (
  appointmentId: string,
  paymentExpiryDate: Date
) => {
  const removeUnpaidTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/remove-unpaid-appointment`,
    { appointmentId: appointmentId },
    Math.floor(paymentExpiryDate.getTime() / 1000)
  );
  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "removeUnpaid",
    taskId: removeUnpaidTaskId,
  });
};

export const scheduleStatusUpdateJob = async (appointment: any) => {
  const appointmentEndTime = new Date(appointment.endDate);
  const appointmentId = appointment._id.toString();

  const statusUpdateTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/status-update`,
    { appointmentId: appointmentId },
    Math.floor(appointmentEndTime.getTime() / 1000)
  );

  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "statusUpdate",
    taskId: statusUpdateTaskId,
  });
};

export const scheduleReminderJobs = async (appointment: any) => {
  const appointmentId = appointment._id.toString();
  const now = new Date();

  const oneDayBefore = subDays(new Date(appointment.startDate), 1);
  const threeHourBefore = subHours(new Date(appointment.startDate), 3);
  const thirtyMinutesBefore = subMinutes(new Date(appointment.startDate), 30);

  if (isAfter(oneDayBefore, addMinutes(now, 1))) {
    const emailReminderTaskIdOneDay = await scheduleTask(
      `${process.env.QSTASH_API_URL}/send-email-reminder`,
      { appointmentId: appointmentId },
      Math.floor(oneDayBefore.getTime() / 1000)
    );

    await ScheduledTask.create({
      appointmentId: appointmentId,
      type: "emailReminder",
      taskId: emailReminderTaskIdOneDay,
    });
  }

  if (isAfter(threeHourBefore, addMinutes(now, 1))) {
    const emailReminderTaskIdOneHour = await scheduleTask(
      `${process.env.QSTASH_API_URL}/send-email-reminder`,
      { clientEmail: appointment.clientEmail, appointmentId: appointmentId },
      Math.floor(threeHourBefore.getTime() / 1000)
    );

    await ScheduledTask.create({
      appointmentId: appointmentId,
      type: "emailReminder",
      taskId: emailReminderTaskIdOneHour,
    });
  }

  const smsReminderTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-sms-reminder`,
    { clientPhone: appointment.clientPhone, appointmentId: appointmentId },
    Math.floor(thirtyMinutesBefore.getTime() / 1000)
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
    const tasks = await ScheduledTask.find({
      appointmentId,
      type: { $in: ["removeUnpaid", "paymentReminder"] },
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
