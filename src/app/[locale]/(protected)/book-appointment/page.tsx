import { getAppointmentTypeById } from "@/data/appointment-types";
import SelectedTherapist from "./selected-therapist";
import { Button } from "@/components/ui/button";

import { getClientByIdAppointments, getTherapistById } from "@/data/user";
import { getCurrentUser } from "@/lib/auth";
import { Link, redirect } from "@/navigation";
import { getTranslations } from "next-intl/server";
import { APPOINTMENT_TYPE_ID } from "@/contants/config";

const BookAppointmentPage = async ({
  params,
}: {
  params: { locale: string };
}) => {
  const ErrorMessages = await getTranslations("ErrorMessages");

  const user = await getCurrentUser();

  if (!user) {
    return ErrorMessages("userNotFound");
  }

  const appointmentType = await getAppointmentTypeById(APPOINTMENT_TYPE_ID);

  const client = await getClientByIdAppointments(user?.id);

  if (!client) {
    return ErrorMessages("userNotFound");
  }

  const selectedTherapist = (
    user?.selectedTherapist
      ? await getTherapistById(user?.selectedTherapist)
      : null
  ) as any;

  // Function to find a valid temporarily reserved appointment
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
    return null; // Return null if no valid appointment is found
  };

  // Retrieve the valid appointment
  const validAppointmentData = findValidTemporarilyReservedAppointment(client);
  if (validAppointmentData) {
    const { appointment, date } = validAppointmentData;
    // Extract necessary details from the found appointment
    const appointmentTypeId = appointmentType._id; // Assume this field exists
    const appointmentId = appointment._id; // MongoDB document ID
    const therapistId = appointment.hostUserId; // Assume this field exists

    // Construct the redirect URL with query params
    const redirectUrl = `/checkout?appointmentTypeId=${appointmentTypeId}&date=${date}&appointmentId=${appointmentId}&therapistId=${therapistId}`;

    redirect(redirectUrl);
  }

  const t = await getTranslations("BookAppointmentPage");

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="relative flex justify-center">
          <div className="p-4 max-w-6xl w-full">
            <div className="bg-secondary p-4 rounded-md mb-6">
              <h1 className="text-3xl font-bold text-center text-primary flex-grow">
                {selectedTherapist ? t("yourTherapist") : t("bookAppointment")}
              </h1>
            </div>

            {selectedTherapist ? (
              <SelectedTherapist
                appointmentType={appointmentType}
                selectedTherapistData={JSON.stringify(selectedTherapist)}
                locale={params.locale}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-xl font-bold mb-4">
                    {t("introCallTitle")}
                  </h2>
                  <p className="mb-4">{t("introCallDescription")}</p>
                  <Link href="/book-appointment/intro-call">
                    <Button className="w-full py-4 text-lg">
                      {t("bookIntroCall")}
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-500 mt-2">
                    {t("recommendedForNewClients")}
                  </p>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-xl font-bold mb-4">
                    {t("browseTherapistsTitle")}
                  </h2>
                  <p className="mb-4">{t("browseTherapistsDescription")}</p>
                  <Link href="/book-appointment/browse-therapists">
                    <Button className="w-full py-4 text-lg">
                      {t("browseTherapistsButton")}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookAppointmentPage;
