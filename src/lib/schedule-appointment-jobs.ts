import { qstashClient, scheduleTask } from "@/lib/qstash";
import ScheduledTask from "@/models/ScheduledTask";
import {
  addMinutes,
  addSeconds,
  isAfter,
  subHours,
  subMinutes,
} from "date-fns";

export const schedulePaymentReminders = async (
  appointmentId: string,
  paymentExpiryDate: Date,
  locale: string
): Promise<void> => {
  const now = new Date();

  /*   const reminderTimes = [
    subHours(paymentExpiryDate, 24),
    subHours(paymentExpiryDate, 6),
    subHours(paymentExpiryDate, 2),
  ]; */
  const reminderTimes = [
    subHours(paymentExpiryDate, 1), // New reminder at 1 hour left
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

export const cancelPayBeforeExpiredJobForAppointment = async (
  appointmentId: string
): Promise<void> => {
  try {
    const task = await ScheduledTask.findOne({
      appointmentId,
      type: "payBeforePaymentExpiredStatusUpdate",
    });

    if (!task) {
      console.log(
        `No 'payBeforePaymentExpiredStatusUpdate' job found for appointment ${appointmentId}.`
      );
      return;
    }

    await qstashClient.messages.delete(task.taskId);
    await ScheduledTask.deleteOne({ taskId: task.taskId });

    console.log(
      `'payBeforePaymentExpiredStatusUpdate' job cancelled for appointment ${appointmentId}.`
    );
  } catch (error) {
    console.error(
      `Error cancelling 'payBeforePaymentExpiredStatusUpdate' job for appointment ${appointmentId}:`,
      error
    );
  }
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
  const now = new Date();

  const tenSecondsAfter = addSeconds(new Date(now), 10);

  const statusUpdateTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/status-update`,
    { appointmentId: appointmentId },
    Math.floor(tenSecondsAfter.getTime() / 1000)
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
  const threeHoursBefore = subHours(new Date(appointment.startDate), 3);

  /* const thirtyMinutesBefore = subMinutes(new Date(appointment.startDate), 30); */
  const twentyFourHoursBefore = subHours(new Date(appointment.startDate), 24);

  const twentyMinutesBefore = subMinutes(new Date(appointment.startDate), 20);
  const tenSecondsAfter = addSeconds(new Date(now), 10);

  if (isAfter(twentyFourHoursBefore, addMinutes(now, 1))) {
    const emailReminderTaskId = await scheduleTask(
      `${process.env.QSTASH_API_URL}/send-email-reminder`,
      { clientEmail: appointment.clientEmail, appointmentId: appointmentId },
      Math.floor(twentyFourHoursBefore.getTime() / 1000),
      locale
    );

    await ScheduledTask.create({
      appointmentId: appointmentId,
      type: "emailReminder",
      taskId: emailReminderTaskId,
    });

    const smsReminderTaskId = await scheduleTask(
      `${process.env.QSTASH_API_URL}/sms-reminder`,
      {
        clientPhone: appointment.clientPhone,
        appointmentId: appointmentId,
        reminder24h: "true",
      },
      Math.floor(twentyFourHoursBefore.getTime() / 1000),
      locale
    );

    await ScheduledTask.create({
      appointmentId: appointmentId,
      type: "smsReminder",
      taskId: smsReminderTaskId,
    });
  } else {
    if (isAfter(twoHoursBefore, addMinutes(now, 1))) {
      const emailReminderTaskId = await scheduleTask(
        `${process.env.QSTASH_API_URL}/send-email-reminder`,
        { clientEmail: appointment.clientEmail, appointmentId: appointmentId },
        Math.floor(twoHoursBefore.getTime() / 1000),
        locale
      );

      await ScheduledTask.create({
        appointmentId: appointmentId,
        type: "emailReminder",
        taskId: emailReminderTaskId,
      });

      const smsReminderTaskId = await scheduleTask(
        `${process.env.QSTASH_API_URL}/sms-reminder`,
        {
          clientPhone: appointment.clientPhone,
          appointmentId: appointmentId,
          reminder2h: "true",
        },
        Math.floor(twoHoursBefore.getTime() / 1000),
        locale
      );

      await ScheduledTask.create({
        appointmentId: appointmentId,
        type: "smsReminder",
        taskId: smsReminderTaskId,
      });
    }
  }

  const smsReminderTaskIdTherapist = await scheduleTask(
    `${process.env.QSTASH_API_URL}/sms-reminder`,
    {
      reminderTherapist: true,
      appointmentId: appointmentId,
    },
    Math.floor(threeHoursBefore.getTime() / 1000),
    locale
  );

  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "smsReminder",
    taskId: smsReminderTaskIdTherapist,
  });

  const meetingLinkTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/send-meeting-link`,
    { clientEmail: appointment.clientEmail, appointmentId: appointmentId },
    Math.floor(twentyMinutesBefore.getTime() / 1000),
    locale
  );

  await ScheduledTask.create({
    appointmentId: appointmentId,
    type: "meetingLink",
    taskId: meetingLinkTaskId,
  });

  const smsReminderTaskId = await scheduleTask(
    `${process.env.QSTASH_API_URL}/sms-reminder`,
    { clientPhone: appointment.clientPhone, appointmentId: appointmentId },
    Math.floor(twentyMinutesBefore.getTime() / 1000),
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
      type: {
        $in: [
          "payBeforePaymentExpiredStatusUpdate",
          "payAfterPaymentExpiredStatusUpdate",
          "paymentReminder",
        ],
      },
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
