import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";

const EndedAppointmentPage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white">
      <h1 className="mb-4 text-3xl">Call Ended</h1>
      <Link href="/appointments">
        <Button variant="secondary">Go to my appointments page</Button>
      </Link>
    </div>
  );
};

export default EndedAppointmentPage;
