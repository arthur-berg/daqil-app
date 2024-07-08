"use client";
import { getMeetings, createMeeting } from "@/actions/meetings";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { useEffect, useState, useTransition } from "react";

const LoadingSpinner = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const MeetingsPageView = () => {
  const [meetings, setMeetings] = useState(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const meetings = await getMeetings();
        if (meetings) {
          setMeetings(meetings);
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    });
  }, []);

  const onClick = async () => {
    startTransition(async () => {
      try {
        const newMeeting = await createMeeting();
        if (newMeeting) {
          const meetings = await getMeetings();
          if (meetings) {
            setMeetings(meetings);
          }
        }
      } catch (error) {
        console.error("Error creating meeting:", error);
      }
    });
  };

  return (
    <div className="relative min-h-screen bg-gray-100 p-8 w-full">
      {(isPending || meetings === null) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
      <h1 className="text-3xl font-bold mb-8">Meeting Rooms</h1>

      <Button onClick={onClick} className="mb-8">
        Create New Meeting
      </Button>
      <div className="flex flex-wrap gap-8 max-w-screen mx-auto w-full">
        {meetings?._embedded ? (
          meetings._embedded.map((meeting) => (
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
    </div>
  );
};

export default MeetingsPageView;
