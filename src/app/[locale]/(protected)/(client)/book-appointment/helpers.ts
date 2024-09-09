import { getClientByIdAppointments } from "@/data/user";
import { redirect } from "@/navigation";

export const redirectUserIfReservationExist = async (
  userId: string,
  ErrorMessages: any
) => {
  const client = await getClientByIdAppointments(userId);

  if (!client) {
    return ErrorMessages("userNotFound");
  }

  const findValidTemporarilyReservedAppointment = (client: any) => {
    for (const appointment of client?.appointments) {
      const validAppointment = appointment.temporarilyReservedAppointments.find(
        (reservedAppointment: any) =>
          reservedAppointment.payment.paymentExpiryDate > new Date()
      );

      if (validAppointment) {
        return {
          appointment: validAppointment,
          date: appointment.date,
        };
      }
    }
    return null;
  };

  const validAppointmentData = findValidTemporarilyReservedAppointment(client);
  if (validAppointmentData) {
    const { appointment, date } = validAppointmentData;
    const appointmentTypeId = appointment.appointmentTypeId;
    const appointmentId = appointment._id;
    const therapistId = appointment.hostUserId;

    const redirectUrl = `/checkout?appointmentTypeId=${appointmentTypeId}&date=${date}&appointmentId=${appointmentId}&therapistId=${therapistId}`;

    redirect(redirectUrl);
  }
};
