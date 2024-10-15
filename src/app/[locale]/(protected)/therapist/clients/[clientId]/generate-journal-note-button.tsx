"use client";

import { generateJournalNote } from "@/actions/generateJournalNote";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
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
  const t = useTranslations("MyClientsPage");

  console.log("archiveId", archiveId);

  const handleGenerateJournalNote = () => {
    startTransition(async () => {
      const data = await generateJournalNote(
        journalNoteId,
        archiveId,
        appointmentId
      );
    });
    console.log(`Generate journal note for ID: ${journalNoteId}`);
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
};

export default GenerateJournalNoteButton;
