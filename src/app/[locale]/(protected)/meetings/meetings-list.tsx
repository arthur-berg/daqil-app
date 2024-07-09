"use client";
import { createMeeting } from "@/actions/meetings";
import LoadingSpinner from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { useTransition } from "react";

const MeetingsList = ({ meetings }: { meetings: any }) => {
  const [isPending, startTransition] = useTransition();

  const onClick = async () => {
    startTransition(async () => {
      try {
        await createMeeting();
      } catch (error) {
        console.error("Error creating meeting:", error);
      }
    });
  };

  return (
    <>
      {(isPending || meetings === null) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}

      <Button onClick={onClick} className="mb-8">
        Create New Meeting
      </Button>
      <div className="flex flex-wrap gap-8 max-w-screen mx-auto w-full">
        {meetings?._embedded ? (
          meetings._embedded.map((meeting: any) => (
            <div
              key={meeting.id}
              className="w-full md:w-1/2 lg:w-1/3 bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-4">
                {meeting.display_name}
              </h2>
              <p className="text-gray-600 mb-2">
                <strong>Type:</strong> {meeting.type}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Meeting Code:</strong> {meeting.meeting_code}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Join Approval Level:</strong>{" "}
                {meeting.join_approval_level}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Created At:</strong>{" "}
                {new Date(meeting.created_at).toLocaleString()}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Expires At:</strong>{" "}
                {new Date(meeting.expires_at).toLocaleString()}
              </p>
              <p
                className={`text-sm ${
                  meeting.is_available ? "text-green-500" : "text-red-500"
                }`}
              >
                {meeting.is_available ? "Available" : "Not Available"}
              </p>
              <div>
                <Link
                  href={`/meetings/${encodeURIComponent(
                    meeting._links.guest_url.href
                  )}`}
                  className="text-blue-500 hover:underline"
                >
                  Join Meeting as Guest
                </Link>
              </div>
              <Link
                href={`/meetings/${encodeURIComponent(
                  meeting._links.host_url.href
                )}`}
                className="text-blue-500 hover:underline"
              >
                Join Meeting as Host
              </Link>
            </div>
          ))
        ) : meetings !== null ? (
          <div className="w-full text-center text-gray-500">
            No meetings available.
          </div>
        ) : null}
      </div>
    </>
  );
};

export default MeetingsList;
