import { getClientById } from "@/data/user";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentUserFullName, getFullName } from "@/utils/formatName";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";

const MyProfileClientPage = async () => {
  await connectToMongoDB();

  const user = await getCurrentUser();
  const fullName = await getCurrentUserFullName();

  const t = await getTranslations("AuthPage");

  if (!user) return null;

  const client = await getClientById(user.id);

  if (!client) return "User not found";

  // Calculate total appointments and get therapist history
  const totalAppointments = client.therapistAppointmentCounts.reduce(
    (acc: number, item: any) => acc + item.appointmentCount,
    0
  );
  const currentTherapist = client.therapistAppointmentCounts.find(
    (history: any) => history.current
  );
  const pastTherapists = client.therapistAppointmentCounts.filter(
    (history: any) => !history.current
  );

  return (
    <div className="bg-white max-w-3xl mx-auto p-6 rounded-lg shadow-lg">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">
        {t("myProfile")}
      </h1>

      {/* User Information Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          {t("personalInformation")}
        </h2>
        <div className="w-full">
          <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
            <p className="text-gray-800">
              <span className="font-semibold">{t("name")}:</span> {fullName}
            </p>

            <p className="text-gray-800">
              <span className="font-semibold">{t("emailLabel")}:</span>{" "}
              {client.email}
            </p>
            <p className="text-gray-800">
              <span className="font-semibold">{t("phoneNumber")}:</span>{" "}
              {user.personalInfo.phoneNumber}
            </p>
            <p className="text-gray-800">
              <span className="font-semibold">{t("dateOfBirth")}:</span>{" "}
              {new Date(user.personalInfo.dateOfBirth).toLocaleDateString()}
            </p>
          </div>
          {/*   <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <p className="text-gray-800">
              <span className="font-semibold">{t("sex")}:</span>{" "}
              {user.personalInfo.sex === "MALE" ? t("male") : t("female")}
            </p> 
            <p className="text-gray-800">
              <span className="font-semibold">{t("dateOfBirth")}:</span>{" "}
              {new Date(user.personalInfo.dateOfBirth).toLocaleDateString()}
            </p> 
            <p className="text-gray-800">
              <span className="font-semibold">Two-Factor Enabled:</span>{" "}
              {user.isTwoFactorEnabled ? "Yes" : "No"}
            </p> 
          </div> */}
        </div>
      </section>

      {/* Appointments and Therapist Information Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          {t("appointmentsAndTherapist")}
        </h2>
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <p className="text-gray-800">
            <span className="font-semibold">{t("totalAppointments")}:</span>{" "}
            {totalAppointments}
          </p>
          {currentTherapist ? (
            <div className="mt-4">
              <p className="text-gray-800">
                <span className="font-semibold">{t("currentTherapist")}:</span>{" "}
                {await getFullName(
                  currentTherapist.therapist.firstName,
                  currentTherapist.therapist.lastName
                )}
              </p>
              <p className="text-gray-800">
                <span className="font-semibold">{t("startedOn")}:</span>{" "}
                {new Date(currentTherapist.startDate).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-800 mt-4">
              <span className="font-semibold">{t("currentTherapist")}:</span>{" "}
              {t("none")}
            </p>
          )}
        </div>
      </section>

      {/* Therapist History Section */}
      {pastTherapists.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            {t("pastTherapists")}
          </h2>
          <ul className="space-y-4">
            {pastTherapists.map(async (history: any, index: number) => (
              <li key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                <p className="text-gray-800">
                  <span className="font-semibold">{t("therapist")}:</span>{" "}
                  {await getFullName(
                    history.therapist.firstName,
                    history.therapist.lastName
                  )}
                </p>
                <p className="text-gray-800">
                  <span className="font-semibold">{t("period")}:</span>{" "}
                  {new Date(history.startDate).toLocaleDateString()} -{" "}
                  {history.endDate
                    ? new Date(history.endDate).toLocaleDateString()
                    : "Present"}
                </p>
                <p className="text-gray-800">
                  <span className="font-semibold">{t("appointments")}:</span>{" "}
                  {history.appointmentCount}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default MyProfileClientPage;
