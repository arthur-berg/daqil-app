import { getClientById } from "@/data/user";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import ClientDetailPageBody from "./client-detail-page-body";

const ClientPage = async ({ params }: { params: { clientId: string } }) => {
  await connectToMongoDB();
  const clientId = params.clientId;
  const client = await getClientById(clientId);
  const t = await getTranslations("MyClientsPage");

  if (!client) return <div>{t("noClientsFound")}</div>;

  const currentTherapistHistory = client.therapistAppointmentCounts.find(
    (history: any) => history.current
  );
  const pastTherapistsHistory = client.therapistAppointmentCounts.filter(
    (history: any) => !history.current
  );
  const clientJson = JSON.stringify(client);

  return (
    <ClientDetailPageBody
      clientId={clientId}
      clientDataJson={clientJson}
      pastTherapistsHistory={pastTherapistsHistory}
      currentTherapistHistory={currentTherapistHistory}
    />
  );
};

export default ClientPage;
