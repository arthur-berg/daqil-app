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
import { useState } from "react";
import JournalNoteForm from "./journal-note-form";

const formatAppointmentTime = (date: any) => {
  return format(new Date(date), "HH:mm");
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
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
  >(null); // Track the ID of the note being edited
  const clientData = JSON.parse(clientDataJson);
  const { firstName, lastName, email, appointments, selectedTherapist } =
    clientData;
  const { getFullName } = useUserName();

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
      <div className="space-y-2 text-center">
        <p className="text-gray-700">
          <strong>{t("email")}:</strong> {email}
        </p>
        <p className="text-gray-700">
          <strong>{t("currentTherapist")}:</strong>{" "}
          {selectedTherapist
            ? `${getFullName(
                selectedTherapist.firstName,
                selectedTherapist.lastName
              )}`
            : t("none")}
        </p>
        {currentTherapistHistory && (
          <p className="text-gray-700">
            <strong>{t("totalAppointments")}:</strong>{" "}
            {currentTherapistHistory.appointmentCount}
          </p>
        )}
        <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 justify-center sm:space-y-0">
          <Link href={`/therapist/clients/${clientId}/schedule-appointment`}>
            <Button className="w-full sm:w-auto">
              {t("scheduleAppointment")}
            </Button>
          </Link>
        </div>
      </div>

      {pastTherapistsHistory.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {t("therapistHistory")}
          </h2>
          <div className="space-y-4">
            {pastTherapistsHistory.map((history: any, index: number) => (
              <div
                key={index}
                className="p-4 border rounded-lg shadow-sm bg-gray-50"
              >
                <p className="text-gray-800">
                  <strong>{t("therapist")}:</strong>{" "}
                  {getFullName(
                    history.therapist.firstName,
                    history.therapist.lastName
                  )}{" "}
                  ({history.therapist.email})
                </p>
                <p className="text-gray-800">
                  <strong>{t("therapistAppointments")}:</strong>{" "}
                  {history.appointmentCount}
                </p>
                <p className="text-gray-800">
                  <strong>{t("therapistPeriod")}:</strong>{" "}
                  {history.startDate.toLocaleDateString()} -{" "}
                  {history.endDate?.toLocaleDateString() || t("current")}
                </p>
              </div>
            ))}
          </div>
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

                        {appointment.journalNoteId.summaryStatus ===
                        "completed" ? (
                          <>
                            {editingJournalNoteId ===
                            appointment.journalNoteId._id ? (
                              <JournalNoteForm
                                setIsEditing={() =>
                                  setEditingJournalNoteId(null)
                                }
                                journalNote={appointment.journalNoteId}
                              />
                            ) : (
                              <>
                                <div>
                                  <strong>Note:</strong>
                                  <p>
                                    {truncateText(
                                      appointment.journalNoteId.note,
                                      100
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <strong>{t("summary")}:</strong>
                                  <div
                                    className="italic text-sm text-gray-600"
                                    dangerouslySetInnerHTML={{
                                      __html: truncateText(
                                        appointment.journalNoteId.summary,
                                        200
                                      ),
                                    }}
                                  />
                                </div>

                                <Button
                                  onClick={() =>
                                    setEditingJournalNoteId(
                                      appointment.journalNoteId._id
                                    )
                                  }
                                >
                                  {t("edit")}
                                </Button>
                              </>
                            )}
                          </>
                        ) : appointment.journalNoteId.summaryStatus ===
                          "pending" ? (
                          <p className="italic text-sm text-gray-600">
                            {t("journalNoteInProgress")}
                          </p>
                        ) : appointment.journalNoteId.summaryStatus ===
                          "review" ? (
                          <>
                            {editingJournalNoteId ===
                            appointment.journalNoteId._id ? (
                              <JournalNoteForm
                                setIsEditing={() =>
                                  setEditingJournalNoteId(null)
                                }
                                journalNote={appointment.journalNoteId}
                              />
                            ) : (
                              <div>
                                <Button
                                  onClick={() =>
                                    setEditingJournalNoteId(
                                      appointment.journalNoteId._id
                                    )
                                  }
                                >
                                  {t("journalNoteIsReadyForReview")}
                                </Button>
                              </div>
                            )}
                          </>
                        ) : appointment.journalNoteId.summaryStatus ===
                          "error" ? (
                          <>
                            <p className="text-red-600 mb-2">
                              {t("errorGeneratingJournalNote")}
                            </p>
                            <div>
                              {editingJournalNoteId ===
                              appointment.journalNoteId._id ? (
                                <JournalNoteForm
                                  setIsEditing={() =>
                                    setEditingJournalNoteId(null)
                                  }
                                  journalNote={appointment.journalNoteId}
                                />
                              ) : (
                                <Button
                                  variant="success"
                                  onClick={() =>
                                    setEditingJournalNoteId(
                                      appointment.journalNoteId._id
                                    )
                                  }
                                >
                                  {t("createJournalNote")}
                                </Button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div>
                            <GenerateJournalNoteButton
                              journalNoteId={appointment.journalNoteId._id.toString()}
                              archiveId={appointment.journalNoteId.archiveId}
                              appointmentId={appointment._id.toString()}
                            />
                          </div>
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
