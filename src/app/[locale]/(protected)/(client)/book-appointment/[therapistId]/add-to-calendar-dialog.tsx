import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { format } from "date-fns";

type DateType = {
  justDate: Date | undefined;
  dateTime: Date | undefined;
};

const AddToCalendarDialog = ({
  open,
  setOpen,
  date,
  appointmentType,
  t,
}: {
  open: boolean;
  setOpen: (show: boolean) => void;
  date: DateType;
  appointmentType: any;
  t: any;
}) => {
  const user = useCurrentUser();

  const userTimeZone = user?.settings?.timeZone || "UTC";

  const calendarStartDate = format(
    new Date(date.dateTime!),
    "yyyyMMdd'T'HHmmss"
  );
  const calendarEndDate = format(new Date(date.dateTime!), "yyyyMMdd'T'HHmmss");

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    appointmentType.title
  )}&dates=${calendarStartDate}/${calendarEndDate}&details=${encodeURIComponent(
    appointmentType.description || ""
  )}&location=${encodeURIComponent("Online")}`;

  const outlookCalendarUrl = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
    appointmentType.title
  )}&startdt=${calendarStartDate}&enddt=${calendarEndDate}&body=${encodeURIComponent(
    appointmentType.description || ""
  )}&location=${encodeURIComponent("Online")}&timezone=${encodeURIComponent(
    userTimeZone
  )}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-11/12 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addToCalendar")}</DialogTitle>
          <DialogDescription>
            <p>{t("addThisEventToYourCalendar")}</p>
            <div className="mt-4 space-y-4">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>{t("addToGoogleCalendar")}</Button>
              </a>
              <a
                href={outlookCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>{t("addToOutlookCalendar")}</Button>
              </a>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCalendarDialog;
