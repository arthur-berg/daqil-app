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
import { MdCheck } from "react-icons/md";
import InviteTherapistForm from "./invite-therapist-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getFullName } from "@/utils/formatName";
import connectToMongoDB from "@/lib/mongoose";
import { Link } from "@/navigation";
import { isPast } from "date-fns";
import SendEmailButton from "@/app/[locale]/(protected)/admin/therapists/send-email-button";

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
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {therapists?.map(async (therapist: any) => (
                <TableRow key={therapist.email}>
                  <TableCell>
                    <Link href={`/admin/therapists/${therapist._id}`}>
                      {await getFullName(
                        therapist.firstName,
                        therapist.lastName
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium text-primary underline">
                    <Link href={`/admin/therapists/${therapist._id}`}>
                      {therapist.email}
                      {console.log("therapist", therapist)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {therapist.emailVerified && therapist.isAccountSetupDone ? (
                      <MdCheck />
                    ) : therapist.therapistInvitationEmail?.status === "SENT" &&
                      !isPast(
                        new Date(therapist.therapistInvitationEmail.expiryDate)
                      ) ? (
                      <div className="flex">
                        <div>
                          Invitation email sent but psychologist has not setup
                          their account yet
                        </div>
                        <SendEmailButton
                          therapistId={therapist._id.toString()}
                          email={therapist.email}
                        />
                      </div>
                    ) : (
                      <SendEmailButton
                        therapistId={therapist._id.toString()}
                        email={therapist.email}
                      />
                    )}
                  </TableCell>
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
