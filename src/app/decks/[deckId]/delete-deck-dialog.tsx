"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteDeckAction } from "@/app/actions/delete-deck";

type DeleteDeckDialogProps = {
  deckId: number;
  deckName: string;
};

export function DeleteDeckDialog({ deckId, deckName }: DeleteDeckDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    const result = await deleteDeckAction({ deckId });
    setPending(false);
    if (result.ok) {
      setOpen(false);
      router.refresh();
      router.push("/dashboard");
      toast.success("Deck deleted successfully");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" aria-label="Delete deck" className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2Icon className="size-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete deck</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the deck{" "}
            <strong className="text-foreground">&quot;{deckName}&quot;</strong>?
            This will permanently remove the deck and all its cards. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => handleConfirm()}
            disabled={pending}
          >
            {pending ? "Deleting…" : "Delete deck"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
