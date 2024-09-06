import { Button } from "@/components/ui/button";
import { getCurrentRole } from "@/lib/auth";
import { Link } from "@/navigation";
import connectToMongoDB from "@/lib/mongoose";

const EndedAppointmentPage = async () => {
  await connectToMongoDB();
  const { isTherapist } = await getCurrentRole();
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-white">
      <h1 className="mb-4 text-3xl">Call Ended</h1>
      <Link href={isTherapist ? `/therapist/appointments` : "/appointments"}>
        <Button variant="secondary">Go to my appointments page</Button>
      </Link>
    </div>
  );
};

export default EndedAppointmentPage;
