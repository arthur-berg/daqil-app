import { getAllClients } from "@/data/user";
import connectToMongoDB from "@/lib/mongoose";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminDashboardPage = async () => {
  await connectToMongoDB();

  const clients = await getAllClients();

  if (!clients)
    return (
      <div className="container mx-auto p-6 bg-white rounded-md">
        No clients found
      </div>
    );

  // Total number of clients
  const totalClients = clients.length;

  // Group new clients by yyyy-mm-dd format (based on createdAt date)
  const groupedNewClients = clients.reduce((acc: any, client: any) => {
    const createdDate = format(new Date(client.createdAt), "yyyy-MM-dd");

    if (!acc[createdDate]) {
      acc[createdDate] = [];
    }
    acc[createdDate].push(client);

    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6 bg-white rounded-md">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Total Clients */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Total Clients</h2>
        <p>{totalClients}</p>
      </div>

      {/* Grouped New Clients by Date */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">New Clients by Date</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>New Clients</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedNewClients).map(([date, clients]: any) => (
              <TableRow key={date}>
                <TableCell>{date}</TableCell>
                <TableCell>{clients.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
