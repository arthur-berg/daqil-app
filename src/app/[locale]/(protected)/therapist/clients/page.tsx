import { getClients } from "@/data/user";
import { getCurrentUser } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/navigation";
import { getFullName } from "@/utils/formatName";
import connectToMongoDB from "@/lib/mongoose";
import { getTranslations } from "next-intl/server";
import PageTitle from "@/components/page-title";

const MyClientsPage = async () => {
  await connectToMongoDB();
  const user = await getCurrentUser();
  if (!user) return;

  const t = await getTranslations("MyClientsPage");

  const clients = await getClients(user.id);

  if (!clients || clients.length === 0) {
    return <div className="text-center p-4">{t("noClientsFound")}</div>;
  }
  return (
    <>
      <div className="max-w-4xl mx-auto">
        <PageTitle title={t("myClients")} />
      </div>
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">{t("name")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("totalAppointments")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map(async (client: any) => (
              <TableRow key={client.email}>
                <TableCell className="font-medium underline text-primary">
                  <Link href={`/therapist/clients/${client.id}`}>
                    {await getFullName(client.firstName, client.lastName)}
                  </Link>
                </TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.totalAppointments}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default MyClientsPage;
