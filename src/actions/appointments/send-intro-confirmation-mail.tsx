"use server";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { getClientByIdAppointments, getUserById } from "@/data/user";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import { sendIntroBookingConfirmationMailWithLink } from "@/lib/mail";
import connectToMongoDB from "@/lib/mongoose";
import { getFullName } from "@/utils/formatName";
import { formatInTimeZone } from "date-fns-tz";
import { getLocale, getTranslations } from "next-intl/server";

export const sendIntroConfirmationMail = async (
  appointmentId: string,
  startDate: Date,
  therapistId: string,
  browserTimeZone: string
) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    const user = await requireAuth([UserRole.CLIENT, UserRole.ADMIN]);

    const client = (await getUserById(user.id)) as any;
    const therapist = (await getUserById(therapistId)) as any;
    const appointmentType = await getAppointmentTypeById(
      APPOINTMENT_TYPE_ID_INTRO_SESSION
    );

    const locale = await getLocale();

    const clientAppointmentDate = formatInTimeZone(
      new Date(startDate),
      browserTimeZone,
      "yyyy-MM-dd"
    );
    const clientAppointmentTime = formatInTimeZone(
      new Date(startDate),
      browserTimeZone,
      "HH:mm"
    );

    const appointmentDetails = {
      appointmentId: appointmentId.toString(),
      clientDate: clientAppointmentDate,
      clientTime: clientAppointmentTime,
      therapistName: `${await getFullName(
        therapist.firstName,
        therapist.lastName
      )}`,
      clientName: `${await getFullName(client.firstName, client.lastName)}`,
      durationInMinutes: appointmentType.durationInMinutes,
      clientTimeZone: client.settings.timeZone,
    };

    await sendIntroBookingConfirmationMailWithLink(
      therapist.email,
      client.email,
      appointmentDetails,
      locale
    );
  } catch (error) {
    console.error(
      "Something happened in send-intro-confirmation-mail action",
      error
    );
    return { error: ErrorMessages("somethingWentWrongWhenSendingEmail") };
  }
};
