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
import Cookies from "js-cookie";

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

  const handleDismiss = () => {
    /*    Cookies.set("timezoneWarningDismissed", "true", { expires: 30 }); */
    setShowTimezoneDialog(false);
  };

  return (
    <Dialog open={showTimezoneDialog} onOpenChange={setShowTimezoneDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            <div>
              <span>{t("browserTimezoneLabel")}</span>{" "}
              <span className="font-bold">
                {formatTimeZoneWithOffset(browserTimeZone)}
              </span>
            </div>
            <div>
              <span>{t("accountSettingsTimezoneLabel")}</span>{" "}
              <span className="font-bold">
                {formatTimeZoneWithOffset(userTimeZone)}
              </span>
            </div>
            <br />
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
          <Button variant="secondary" onClick={handleDismiss}>
            {t("timezonesAligned")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimezoneWarningDialog;
