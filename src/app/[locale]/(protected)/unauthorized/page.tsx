import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";

const UnauthorizedPage = () => {
  return (
    <div className="h-full flex items-center justify-center ">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Unauthorized Access</h2>
        <p className="text-gray-700 mb-8">
          You do not have the necessary permissions to view this page.
        </p>
        <Link href="/settings">
          <Button>Go to Profile page</Button>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
