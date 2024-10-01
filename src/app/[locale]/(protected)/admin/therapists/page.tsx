import { getTherapistsAdminView } from "@/data/user";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import InviteTherapistForm from "./invite-therapist-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getFullName } from "@/utils/formatName";
import connectToMongoDB from "@/lib/mongoose";
import { Link } from "@/navigation";

const AdminTherapistsPage = async () => {
  await connectToMongoDB();
  const therapists = await getTherapistsAdminView();

  return (
    <Card className="w-full md:w-[600px]">
      <CardHeader>
        <p>🔑 Admin Dashboard</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div>
            <InviteTherapistForm />
          </div>
          <div className="text-center mt-8 mb-4">All therapists</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {therapists?.map(async (therapist) => (
                <TableRow key={therapist.email}>
                  <TableCell className="font-medium text-primary underline">
                    <Link href={`/admin/therapists/${therapist._id}`}>
                      {await getFullName(
                        therapist.firstName,
                        therapist.lastName
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>{therapist.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTherapistsPage;
