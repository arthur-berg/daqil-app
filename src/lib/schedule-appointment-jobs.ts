import { qstashClient, scheduleTask } from "@/lib/qstash"; // Import necessary functions
import ScheduledTask from "@/models/ScheduledTask";

export const schedulePaymentReminders = async (
  appointmentId: string,
  paymentExpiryDate: Date
) => {
  const now = new Date();

  // Calculate reminder times
  const reminderTimes = [
    new Date(paymentExpiryDate.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
    new Date(paymentExpiryDate.getTime() - 6 * 60 * 60 * 1000), // 6 hours before
    new Date(paymentExpiryDate.getTime() - 1 * 60 * 60 * 1000), // 1 hour before
  ];

  for (const reminderTime of reminderTimes) {
    if (reminderTime > now) {
      const unixTimestampInSeconds = Math.floor(reminderTime.getTime() / 1000);
      const taskId = await scheduleTask(
        `${process.env.QSTASH_API_URL}/send-payment-reminder`,
        { appointmentId },
        unixTimestampInSeconds
      );

      await ScheduledTask.create({
        appointmentId: appointmentId,
        type: "paymentReminder",
        taskId,
      });
    }
  }
};

export const scheduleCancelUnpaidJobs = async (
  appointmentId: string,
  paymentExpiryDate: Date
) => {
  const cancelUnpaidTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/cancel-unpaid`,
    { appointmentId: appointmentId },
    Math.floor(paymentExpiryDate.getTime() / 1000)
  );
  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "cancelUnpaid",
    taskId: cancelUnpaidTaskId,
  });
};

// Function to schedule jobs related to an appointment for testing purposes
export const scheduleAppointmentJobs = async (appointment: any) => {
  // Populate participants field to get the user details
  const appointmentEndTime = new Date(appointment.endDate);
  const paymentExpiryDate = new Date(appointment.payment.paymentExpiryDate);
  const appointmentId = appointment._id.toString();

  const now = new Date();
  const tenSecondsLater = new Date(now.getTime() + 10 * 1000); // 10 seconds from now

  console.log("appointmentId", appointmentId);

  // Schedule status update job 10 seconds from now
  /*  const statusUpdateTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/status-update`,
    { appointmentId: appointmentId },
    Math.floor(appointmentEndTime.getTime() / 1000)
  );
 */
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

  const oneDayBefore = new Date(
    appointment.startDate.getTime() - 24 * 60 * 60 * 1000
  );
  const oneHourBefore = new Date(
    appointment.startDate.getTime() - 60 * 60 * 1000
  );

  const thirtyMinutesBefore = new Date(
    appointment.startDate.getTime() - 30 * 60 * 1000
  );

  // Email reminder 1 day before
  /*  const emailReminderTaskIdOneDay = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-email-reminder`,
    { appointmentId: appointmentId },
    Math.floor(oneDayBefore.getTime() / 1000)
  );
 */
  const emailReminderTaskIdOneDay = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-email-reminder`,
    { appointmentId: appointmentId },
    Math.floor(tenSecondsLater.getTime() / 1000)
  );
  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "emailReminder",
    taskId: emailReminderTaskIdOneDay,
  });

  // Email reminder 1 hour before
  /* const emailReminderTaskIdOneHour = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-email-reminder`,
    { clientEmail: appointment.clientEmail, appointmentId: appointmentId },
    Math.floor(oneHourBefore.getTime() / 1000)
  ); */

  const emailReminderTaskIdOneHour = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-email-reminder`,
    { clientEmail: appointment.clientEmail, appointmentId: appointmentId },
    Math.floor(tenSecondsLater.getTime() / 1000)
  );

  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "emailReminder",
    taskId: emailReminderTaskIdOneHour,
  });

  // Schedule SMS reminder job 30 min before the appointment starts
  /*  const smsReminderTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-sms-reminder`,
    { clientPhone: appointment.clientPhone, appointmentId: appointmentId },
    Math.floor(thirtyMinutesBefore.getTime() / 1000)
  ); */

  const smsReminderTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-sms-reminder`,
    { clientPhone: appointment.clientPhone, appointmentId: appointmentId },
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
