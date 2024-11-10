import { DataTable } from "./data-table";
import { Client, columns } from "./columns";
import { getAllClientsAdmin } from "@/data/user";
import connectToMongoDB from "@/lib/mongoose";

const AllClientsPage = async () => {
  await connectToMongoDB();

  const clients = (await getAllClientsAdmin()) as Client[];

  return (
    <div className="container mx-auto py-10 bg-white rounded-md">
      <DataTable columns={columns} data={clients} />
    </div>
  );
};

export default AllClientsPage;
