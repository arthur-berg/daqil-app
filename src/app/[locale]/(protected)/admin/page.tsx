import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/navigation";

const AdminPage = () => {
  return (
    <Card className="w-full md:w-[600px]">
      <CardHeader>
        <p>🔑 Admin Dashboard</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-row items-center justify-between p-3 ">
          <Link href="/admin/therapists">
            <Button>Manage therapists</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPage;
