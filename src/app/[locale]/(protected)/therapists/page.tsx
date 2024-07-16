import { Button } from "@/components/ui/button";
import { getTherapists } from "@/data/user";
import { Link } from "@/navigation";

const TherapistsPage = async () => {
  const therapists = await getTherapists();

  return (
    <div className="flex justify-center">
      <div className="p-4 ">
        <div className="bg-secondary p-2 rounded-md mb-2">
          <h1 className="text-2xl font-bold text-center">Therapists</h1>
        </div>
        <div className="flex flex-wrap gap-4">
          {therapists?.map((therapist) => (
            <div key={therapist.email} className="w-full lg:w-92 px-2 mb-4">
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="font-bold text-lg mb-2">
                  {therapist.firstName} {therapist.lastName}
                </div>
                <div className="text-gray-700 mb-2">{therapist.email}</div>
                {therapist.userDescription && (
                  <>
                    <div className="text-sm text-gray-500">
                      <div className="mb-2">
                        {therapist.userDescription.title}
                      </div>
                      <div>{therapist.userDescription.description}</div>
                    </div>
                  </>
                )}
                <div className="mt-2 flex justify-center">
                  <Link href={`/therapists/${therapist._id}`}>
                    <Button>Book session</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TherapistsPage;
