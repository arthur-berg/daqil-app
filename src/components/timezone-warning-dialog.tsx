import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/navigation";
import { formatTimeZoneWithOffset } from "@/utils/timeZoneUtils";
import { useTranslations } from "next-intl";

const TimezoneWarningDialog = ({
  showTimezoneDialog,
  setShowTimezoneDialog,
  userTimeZone,
  browserTimeZone,
}: {
  showTimezoneDialog: boolean;
  setShowTimezoneDialog: (show: boolean) => void;
  userTimeZone: string;
  browserTimeZone: string;
}) => {
  const t = useTranslations("TimezoneWarningDialog");

  const handleGoToSettings = () => {
    setShowTimezoneDialog(false);
  };

  return (
    <Dialog open={showTimezoneDialog} onOpenChange={setShowTimezoneDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", {
              browserTimeZone: formatTimeZoneWithOffset(browserTimeZone),
              userTimeZone: formatTimeZoneWithOffset(userTimeZone),
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Link href="/settings">
            <Button variant="success" onClick={handleGoToSettings}>
              {t("goToSettings")}
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimezoneWarningDialog;
