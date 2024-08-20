"use client";

import { deleteDiscountCode } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { BeatLoader } from "react-spinners";

const DeleteDiscountCodeButton = ({
  discountCodeId,
}: {
  discountCodeId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { responseToast } = useToast();

  const t = useTranslations("AdminPage");

  const handleDelete = () => {
    startTransition(async () => {
      // Delete the discount code
      const data = await deleteDiscountCode(discountCodeId);
      responseToast(data);
      setDialogOpen(false);
    });
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setDialogOpen(true)}>
        {t("delete")}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          {isPending ? (
            <div className="flex items-center flex-col">
              <BeatLoader />
              <div className="text-lg font-medium mt-4">
                {t("deletingDiscountCode")}
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{t("areYouSureYouWantToDelete")}</DialogTitle>
              </DialogHeader>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {t("close")}
                </Button>
                <Button variant="destructive" onClick={() => handleDelete()}>
                  {t("delete")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteDiscountCodeButton;
