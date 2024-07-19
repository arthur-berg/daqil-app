import { getTherapists } from "@/data/user";
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
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const AdminTherapistsPage = async () => {
  const therapists = await getTherapists();
  const messages = await getMessages();

  return (
    <Card className="w-full md:w-[600px]">
      <CardHeader>
        <p>🔑 Admin Dashboard</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div>
            <NextIntlClientProvider messages={messages}>
              <InviteTherapistForm />
            </NextIntlClientProvider>
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
              {therapists?.map((therapist) => (
                <TableRow key={therapist.email}>
                  <TableCell className="font-medium">
                    {therapist.firstName} {therapist.lastName}
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
