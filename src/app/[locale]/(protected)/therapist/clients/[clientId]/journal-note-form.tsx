"use client";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import dynamic from "next/dynamic";
import { ReactQuillProps } from "react-quill";

const ReactQuill = dynamic(() => import("react-quill") as any, {
  ssr: false,
}) as React.ComponentType<ReactQuillProps>;

import "react-quill/dist/quill.snow.css";
import { JournalNoteSchema } from "@/schemas";
import { updateJournalNote } from "@/actions/updateJournalNote";

const JournalNoteForm = ({
  journalNote,
  setIsEditing,
}: {
  journalNote: any;
  setIsEditing: (isEditing: boolean) => void;
}) => {
  const [isPending, startTransition] = useTransition();
  const { responseToast } = useToast();

  const form = useForm<z.infer<typeof JournalNoteSchema>>({
    resolver: zodResolver(JournalNoteSchema),
    defaultValues: {
      summary: journalNote?.summary,
      note: journalNote?.note || "",
    },
  });

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const onSubmit = (values: z.infer<typeof JournalNoteSchema>) => {
    startTransition(async () => {
      const data = await updateJournalNote(
        journalNote._id,
        values,
        journalNote.summaryStatus
      );
      responseToast(data);
      if (data.success) {
        setIsEditing(false);
        form.reset();
      }
    });
  };

  return (
    <div className="journal-note-editor">
      <Form {...form}>
        <form
          className="space-y-8 w-full"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Journal Note</h2>

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <ReactQuill
                      value={field.value}
                      onChange={field.onChange}
                      className="h-64"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator className="my-6" />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-6" />

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={isPending}>
              Save
            </Button>
            <Button
              onClick={handleCancel}
              variant="secondary"
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default JournalNoteForm;
