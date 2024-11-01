"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import GenerateJournalNoteButton from "@/app/[locale]/(protected)/therapist/clients/[clientId]/generate-journal-note-button";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useUserName } from "@/hooks/use-user-name";
import { useMemo, useState } from "react";
import JournalNoteForm from "./journal-note-form";

const formatAppointmentTime = (date: any) => {
  return format(new Date(date), "HH:mm");
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

const renderJournalNoteActions = (
  appointment: any,
  editingJournalNoteId: string | null,
  setEditingJournalNoteId: Function,
  t: any,
  setExpandedNotes: any,
  expandedNotes: any
) => {
  const note = appointment.journalNoteId;
  const isExpanded = expandedNotes[note._id] || false;

  switch (note.summaryStatus) {
    case "completed":
      return (
        <div>
          {editingJournalNoteId === note._id ? (
            <JournalNoteForm
              setIsEditing={() => setEditingJournalNoteId(null)}
              journalNote={note}
            />
          ) : (
            <div>
              <p
                dangerouslySetInnerHTML={{
                  __html: isExpanded
                    ? note.summary // Show full note if expanded
                    : truncateText(note.summary, 100), // Truncated version if not expanded
                }}
                className="mb-2"
              ></p>
              <Button
                variant="link"
                onClick={() =>
                  setExpandedNotes((prev: any) => ({
                    ...prev,
                    [note._id]: !isExpanded,
                  }))
                }
              >
                {isExpanded ? t("showLess") : t("readFullNote")}
              </Button>
              <Button
                variant="secondary"
                className="ml-4"
                onClick={() => setEditingJournalNoteId(note._id)}
              >
                {t("edit")}
              </Button>
            </div>
          )}
        </div>
      );
    case "pending":
      return (
        <p className="italic text-sm text-gray-600">
          {t("journalNoteInProgress")}
        </p>
      );
    case "review":
      return (
        <div>
          {editingJournalNoteId === note._id ? (
            <JournalNoteForm
              setIsEditing={() => setEditingJournalNoteId(null)}
              journalNote={note}
            />
          ) : (
            <Button onClick={() => setEditingJournalNoteId(note._id)}>
              {t("journalNoteIsReadyForReview")}
            </Button>
          )}
        </div>
      );
    case "error":
      return (
        <div>
          {editingJournalNoteId === note._id ? (
            <JournalNoteForm
              setIsEditing={() => setEditingJournalNoteId(null)}
              journalNote={note}
            />
          ) : (
            <>
              <p className="text-destructive mb-2">
                {t("errorGeneratingJournalNote")}
              </p>
              <Button
                variant="success"
                onClick={() => setEditingJournalNoteId(note._id)}
              >
                {t("createJournalNote")}
              </Button>
            </>
          )}
        </div>
      );
    default:
      return (
        <GenerateJournalNoteButton
          journalNoteId={note._id.toString()}
          archiveId={note.archiveId}
          appointmentId={appointment._id.toString()}
        />
      );
  }
};

const ClientDetailPageBody = ({
  clientDataJson,
  currentTherapistHistory,
  pastTherapistsHistory,
  clientId,
}: {
  clientDataJson: string;
  currentTherapistHistory: any;
  pastTherapistsHistory: any;
  clientId: string;
}) => {
  const t = useTranslations("MyClientsPage");
  const [editingJournalNoteId, setEditingJournalNoteId] = useState<
    string | null
  >(null);
  const [expandedNotes, setExpandedNotes] = useState({});
  const clientData = JSON.parse(clientDataJson);
  const { firstName, lastName, email, appointments, selectedTherapist } =
    clientData;
  const { getFullName } = useUserName();

  const generateJournalNotes = useMemo(
    () =>
      appointments.flatMap((appointment: any) =>
        appointment.bookedAppointments.filter(
          (app: any) => app.journalNoteId?.summaryStatus === "notStarted"
        )
      ),
    [appointments]
  );

  const reviewJournalNotes = useMemo(
    () =>
      appointments.flatMap((appointment: any) =>
        appointment.bookedAppointments.filter(
          (app: any) => app.journalNoteId?.summaryStatus === "review"
        )
      ),
    [appointments]
  );

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      <div className="mb-4 flex items-center flex-col sm:items-start">
        <Link href={`/therapist/clients`}>
          <Button variant="secondary">{t("goBackToClients")}</Button>
        </Link>
      </div>

      <h1 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
        {getFullName(firstName, lastName)}
      </h1>
      <div className="space-y-2 text-center text-gray-700">
        <p>
          <strong>{t("email")}:</strong> {email}
        </p>
        <p>
          <strong>{t("currentTherapist")}:</strong>{" "}
          {selectedTherapist
            ? getFullName(
                selectedTherapist.firstName,
                selectedTherapist.lastName
              )
            : t("none")}
        </p>
        {currentTherapistHistory && (
          <p>
            <strong>{t("totalAppointments")}:</strong>{" "}
            {currentTherapistHistory.appointmentCount}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 justify-center sm:space-y-0">
        <Link href={`/therapist/clients/${clientId}/schedule-appointment`}>
          <Button className="w-full sm:w-auto">
            {t("scheduleAppointment")}
          </Button>
        </Link>
      </div>

      {/* Notifications for Generate and Review Journal Notes */}
      {generateJournalNotes.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-red-100 text-red-800 border-l-4 border-red-500">
          <h3 className="font-semibold">{t("actionRequiredGenerateTitle")}</h3>
          <ul>
            {generateJournalNotes.map((appointment: any) => (
              <li
                key={appointment._id}
                className="flex justify-between items-center mt-2"
              >
                <span>
                  {t("appointmentDateTime", {
                    date: new Date(appointment.startDate).toLocaleDateString(),
                    time: formatAppointmentTime(appointment.startDate),
                  })}
                </span>
                <GenerateJournalNoteButton
                  journalNoteId={appointment.journalNoteId._id.toString()}
                  archiveId={appointment.journalNoteId.archiveId}
                  appointmentId={appointment._id.toString()}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {reviewJournalNotes.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500">
          <h3 className="font-semibold">{t("actionRequiredReviewTitle")}</h3>
          <p>{t("reviewNotePromptHeader")}</p>
          <ul>
            {reviewJournalNotes.map((appointment: any) => (
              <li key={appointment._id} className="mt-2">
                <span>
                  {t("appointmentDateTime", {
                    date: new Date(appointment.startDate).toLocaleDateString(),
                    time: formatAppointmentTime(appointment.startDate),
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Appointments Accordion */}
      <div className="mt-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          {t("appointments")}
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {appointments.map((appointmentDate: any) => (
            <AccordionItem
              key={appointmentDate._id}
              value={appointmentDate._id}
            >
              <AccordionTrigger>
                {new Date(appointmentDate.date).toLocaleDateString()}
              </AccordionTrigger>
              <AccordionContent>
                {appointmentDate.bookedAppointments.map((appointment: any) => (
                  <div
                    key={appointment._id}
                    className="p-4 border rounded-lg shadow-sm bg-gray-50"
                  >
                    <div className="text-gray-800">
                      <strong>{t("time")}:</strong>{" "}
                      {`${formatAppointmentTime(
                        appointment.startDate
                      )} - ${formatAppointmentTime(appointment.endDate)}`}
                    </div>
                    <div className="text-gray-800">
                      <strong>{t("status")}:</strong> {appointment.status}
                    </div>
                    <div className="text-gray-800">
                      <strong>{t("therapist")}:</strong>{" "}
                      {getFullName(
                        appointment.hostUserId.firstName,
                        appointment.hostUserId.lastName
                      )}
                    </div>
                    {appointment.journalNoteId && (
                      <div className="mt-4 bg-white border-l-4 border-gray-400 p-4">
                        <div className="mb-2">
                          <strong>{t("journalNote")}:</strong>
                        </div>
                        {renderJournalNoteActions(
                          appointment,
                          editingJournalNoteId,
                          setEditingJournalNoteId,
                          t,
                          setExpandedNotes,
                          expandedNotes
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default ClientDetailPageBody;
