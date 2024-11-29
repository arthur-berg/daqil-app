"use client";

import {
  addTherapistPaidAmount,
  removeTherapistPaidAmount,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; // Import Input component

const PayButton = ({ therapistId }: { therapistId: string }) => {
  const [isPending, startTransition] = useTransition();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const [amount, setAmount] = useState(""); // State for input value
  const { responseToast } = useToast();

  const handleAddClick = async () => {
    startTransition(async () => {
      const data = await addTherapistPaidAmount(therapistId, amount);
      responseToast(data);
      setIsAddDialogOpen(false);
      setAmount("");
    });
  };

  const handleRemoveClick = async () => {
    startTransition(async () => {
      const data = await removeTherapistPaidAmount(therapistId, amount);
      responseToast(data);
      setIsRemoveDialogOpen(false);
      setAmount("");
    });
  };

  return (
    <>
      <Button
        variant="success"
        className="mr-2"
        onClick={() => {
          setIsAddDialogOpen(true);
        }}
      >
        Add amount paid
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          setIsRemoveDialogOpen(true);
        }}
      >
        Remove amount paid
      </Button>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-11/12 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit psychologist paid amount</DialogTitle>
            <DialogDescription>
              Enter the new amount in dollars to update the payment record.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in dollars"
            />
          </div>
          <DialogFooter>
            <div className="flex flex-col sm:flex-row sm:space-x-2 rtl:space-x-reverse">
              <Button
                variant="success"
                disabled={isPending || !amount}
                onClick={handleAddClick}
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="secondary"
                disabled={isPending}
                onClick={() => {
                  setIsAddDialogOpen(false);
                }}
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="w-11/12 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit psychologist paid amount</DialogTitle>
            <DialogDescription>
              Enter the new amount in dollars to update the payment record.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in dollars"
            />
          </div>
          <DialogFooter>
            <div className="flex flex-col sm:flex-row sm:space-x-2 rtl:space-x-reverse">
              <Button
                variant="success"
                disabled={isPending || !amount}
                onClick={handleRemoveClick}
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="secondary"
                disabled={isPending}
                onClick={() => {
                  setIsRemoveDialogOpen(false);
                }}
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PayButton;
