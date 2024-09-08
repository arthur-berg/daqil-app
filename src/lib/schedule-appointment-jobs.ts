import { qstashClient, scheduleTask } from "@/lib/qstash"; // Import necessary functions
import ScheduledTask from "@/models/ScheduledTask";
import {
  addMinutes,
  addSeconds,
  isAfter,
  subDays,
  subHours,
  subMinutes,
  subSeconds,
} from "date-fns";

export const schedulePaymentReminders = async (
  appointmentId: string,
  paymentExpiryDate: Date,
  locale: string
): Promise<void> => {
  const now = new Date();

  const reminderTimes = [
    subDays(paymentExpiryDate, 24), // 24 hours before payment expires
    subHours(paymentExpiryDate, 6), // 6 hours before payment expires
    subHours(paymentExpiryDate, 2), // 2 hours before payment expires
  ];

  const validReminderTimes = reminderTimes.filter((reminderTime) =>
    isAfter(reminderTime, now)
  );

  const taskPromises = validReminderTimes.map(async (reminderTime) => {
    const unixTimestampInSeconds = Math.floor(reminderTime.getTime() / 1000);
    const taskId: string = await scheduleTask(
      `${process.env.QSTASH_API_URL}/send-payment-reminder`,
      { appointmentId },
      unixTimestampInSeconds,
      locale
    );

    await ScheduledTask.create({
      appointmentId: appointmentId,
      type: "paymentReminder",
      taskId,
    });
  });

  await Promise.all(taskPromises);
};

export const schedulePayBeforePaymentExpiredStatusUpdateJobs = async (
  appointmentId: string,
  paymentExpiryDate: Date,
  locale: string
) => {
  const taskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/pay-before-booking/payment-expired-status-update`,
    { appointmentId: appointmentId },
    Math.floor(paymentExpiryDate.getTime() / 1000),
    locale
  );
  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "payBeforePaymentExpiredStatusUpdate",
    taskId: taskId,
  });
};

export const schedulePayAfterPaymentExpiredStatusUpdateJobs = async (
  appointmentId: string,
  paymentExpiryDate: Date,
  locale: string
) => {
  console.log("paymentExpiryDate", paymentExpiryDate);
  const taskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/pay-after-booking/payment-expired-status-update`,
    { appointmentId: appointmentId },
    Math.floor(paymentExpiryDate.getTime() / 1000),
    locale
  );
  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "payAfterPaymentExpiredStatusUpdate",
    taskId: taskId,
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

export const scheduleReminderJobs = async (
  appointment: any,
  locale: string
) => {
  const appointmentId = appointment._id.toString();
  const now = new Date();

  /* const oneDayBefore = subDays(new Date(appointment.startDate), 1); */
  const twoHoursBefore = subHours(new Date(appointment.startDate), 2);
  const thirtyMinutesBefore = subMinutes(new Date(appointment.startDate), 30);
  /*   const tenSecondsAfter = addSeconds(new Date(now), 10); */

  /*  if (isAfter(oneDayBefore, addMinutes(now, 1))) {
    const emailReminderTaskIdOneDay = await scheduleTask(
      `${process.env.QSTASH_API_URL}/send-email-reminder`,
      { appointmentId: appointmentId },
      Math.floor(oneDayBefore.getTime() / 1000),
      locale
    );

    await ScheduledTask.create({
      appointmentId: appointmentId,
      type: "emailReminder",
      taskId: emailReminderTaskIdOneDay,
    });
  } */

  if (isAfter(twoHoursBefore, addMinutes(now, 1))) {
    const emailReminderTaskIdOneHour = await scheduleTask(
      `${process.env.QSTASH_API_URL}/send-email-reminder`,
      { clientEmail: appointment.clientEmail, appointmentId: appointmentId },
      Math.floor(twoHoursBefore.getTime() / 1000),
      locale
    );

    await ScheduledTask.create({
      appointmentId: appointmentId,
      type: "emailReminder",
      taskId: emailReminderTaskIdOneHour,
    });
  }

  const smsReminderTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/sms-reminder`,
    { clientPhone: appointment.clientPhone, appointmentId: appointmentId },
    Math.floor(thirtyMinutesBefore.getTime() / 1000),
    locale
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
