import { qstashClient, scheduleTask } from "@/lib/qstash"; // Removed unused imports
import ScheduledTask from "@/models/ScheduledTask";

export const schedulePaymentReminders = async (
  appointmentId: string,
  paymentExpiryDate: Date,
  clientEmail: string
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
        { appointmentId, clientEmail },
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

// Function to schedule jobs related to an appointment
export const scheduleAppointmentJobs = async (appointment: any) => {
  const appointmentEndTime = new Date(appointment.endDate);
  const paymentExpiryDate = new Date(appointment.payment.paymentExpiryDate);

  // Schedule status update job at the exact end time of the appointment
  const statusUpdateTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/status-update`,
    { appointmentId: appointment._id },
    Math.floor(appointmentEndTime.getTime() / 1000)
  );

  await ScheduledTask.create({
    appointmentId: appointment._id,
    type: "statusUpdate",
    taskId: statusUpdateTaskId,
  });

  // Schedule cancel unpaid appointments job at the payment expiry date
  const cancelUnpaidTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/cancel-unpaid`,
    { appointmentId: appointment._id },
    Math.floor(paymentExpiryDate.getTime() / 1000)
  );

  await ScheduledTask.create({
    appointmentId: appointment._id,
    type: "cancelUnpaid",
    taskId: cancelUnpaidTaskId,
  });

  // Schedule email reminder jobs
  const oneDayBefore = new Date(
    appointment.startDate.getTime() - 24 * 60 * 60 * 1000
  );
  const oneHourBefore = new Date(
    appointment.startDate.getTime() - 60 * 60 * 1000
  );

  // Email reminder 1 day before
  const emailReminderTaskIdOneDay = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-email-reminder`,
    { clientEmail: appointment.clientEmail, appointmentId: appointment._id },
    Math.floor(oneDayBefore.getTime() / 1000)
  );

  await ScheduledTask.create({
    appointmentId: appointment._id,
    type: "emailReminder",
    taskId: emailReminderTaskIdOneDay,
  });

  // Email reminder 1 hour before
  const emailReminderTaskIdOneHour = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-email-reminder`,
    { clientEmail: appointment.clientEmail, appointmentId: appointment._id },
    Math.floor(oneHourBefore.getTime() / 1000)
  );

  await ScheduledTask.create({
    appointmentId: appointment._id,
    type: "emailReminder",
    taskId: emailReminderTaskIdOneHour,
  });

  // Schedule SMS reminder job 1 hour before the appointment starts
  const smsReminderTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-sms-reminder`,
    { clientPhone: appointment.clientPhone, appointmentId: appointment._id },
    Math.floor(oneHourBefore.getTime() / 1000)
  );

  await ScheduledTask.create({
    appointmentId: appointment._id,
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
      _id: { $in: taskIds },
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
      _id: { $in: taskIds },
    });
  } catch (error) {
    console.error(
      `Error cancelling payment-related jobs for appointment ${appointmentId}:`,
      error
    );
  }
};
