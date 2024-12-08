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
import { getUTCOffset, formatTimeZoneWithOffset } from "@/utils/timeZoneUtils";
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
    Cookies.set(
      "timezoneWarningOffsetDismissed",
      getUTCOffset(browserTimeZone),
      {
        expires: 30,
      }
    );
    setShowTimezoneDialog(false);
  };

  return (
    <Dialog open={showTimezoneDialog} onOpenChange={setShowTimezoneDialog}>
      <DialogContent className="w-11/12 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            <div>
              <div>{t("browserTimezoneLabel")}</div>{" "}
              <span className="font-bold">
                {formatTimeZoneWithOffset(browserTimeZone)}
              </span>
            </div>
            <div>
              <div>{t("accountSettingsTimezoneLabel")}</div>{" "}
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
          <div className="flex flex-col items-center sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2 sm:rtl:space-x-reverse">
            <Link href="/settings">
              <Button variant="success" onClick={handleGoToSettings}>
                {t("goToSettings")}
              </Button>
            </Link>
            <Button variant="secondary" onClick={handleDismiss}>
              {t("timezonesAligned")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimezoneWarningDialog;
