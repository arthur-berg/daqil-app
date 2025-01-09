import {
  APPOINTMENT_TYPE_ID_INTRO_SESSION,
  APPOINTMENT_TYPE_ID_LONG_SESSION,
  APPOINTMENT_TYPE_ID_SHORT_SESSION,
} from "@/contants/config";
import { getAppointmentTypesByIDs } from "@/data/appointment-types";
import { getAllClientsAdmin, getTherapistsAdminView } from "@/data/user";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import BookAppointmentCalendar from "@/app/[locale]/(protected)/admin/book-appointment/book-appointment-calendar";

const BookAppointmentPage = async () => {
  await connectToMongoDB();
  const therapists = await getTherapistsAdminView();
  const ErrorMessages = await getTranslations("ErrorMessages");

  const appointmentTypes = await getAppointmentTypesByIDs([
    APPOINTMENT_TYPE_ID_SHORT_SESSION,
    APPOINTMENT_TYPE_ID_LONG_SESSION,
    APPOINTMENT_TYPE_ID_INTRO_SESSION,
  ]);

  const clients = (await getAllClientsAdmin()) as any[];

  if (!appointmentTypes) {
    return ErrorMessages("appointmentTypeNotExist");
  }

  return (
    <div className="container p-4 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <BookAppointmentCalendar
        therapistsJson={JSON.stringify(therapists)}
        appointmentTypes={appointmentTypes}
        clientsJson={JSON.stringify(clients)}
      />
    </div>
  );
};

export default BookAppointmentPage;
