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

const MyClientsPage = async () => {
  await connectToMongoDB();

  const user = await getCurrentUser();
  if (!user) return;

  const clients = await getClients(user.id);

  if (!clients || clients.length === 0) {
    return <div className="text-center p-4">No clients found.</div>;
  }
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      <h1 className="text-3xl font-bold text-center mb-6">My Clients</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Total Appointments</TableHead>
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
  );
};

export default MyClientsPage;
