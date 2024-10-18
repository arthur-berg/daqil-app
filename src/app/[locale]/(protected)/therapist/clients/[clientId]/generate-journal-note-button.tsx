"use client";

import { generateJournalNote } from "@/actions/generateJournalNote";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { BeatLoader } from "react-spinners";

const GenerateJournalNoteButton = ({
  journalNoteId,
  archiveId,
  appointmentId,
}: {
  journalNoteId: string;
  archiveId: string;
  appointmentId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const { responseToast } = useToast();
  const [generationInProgress, setGenerationInProgress] = useState(false);
  const t = useTranslations("MyClientsPage");

  const handleGenerateJournalNote = () => {
    startTransition(async () => {
      const data = await generateJournalNote(
        journalNoteId,
        archiveId,
        appointmentId
      );

      responseToast(data);

      if (data.success) {
        setGenerationInProgress(true);
      }
    });
  };

  return (
    <Button
      variant="success"
      onClick={() => handleGenerateJournalNote()}
      className="mt-2"
      disabled={isPending}
    >
      {isPending ? (
        <BeatLoader size={8} color={"#fff"} />
      ) : (
        t("generateJournalNote")
      )}
    </Button>
  );

  /*  return generationInProgress ? (
    <>
      <p className="italic text-sm text-gray-600">
        {t("journalNoteInProgress")}
      </p>
    </>
  ) : (
    <Button
      variant="success"
      onClick={() => handleGenerateJournalNote()}
      className="mt-2"
      disabled={isPending}
    >
      {isPending ? (
        <BeatLoader size={8} color={"#fff"} />
      ) : (
        t("generateJournalNote")
      )}
    </Button>
  ); */
};

export default GenerateJournalNoteButton;
