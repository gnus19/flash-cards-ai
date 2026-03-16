"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteCardAction } from "@/app/actions/delete-card";
import { updateCardAction } from "@/app/actions/update-card";

type CardItemProps = {
  card: { id: number; front: string; back: string };
};

export function CardItem({ card }: CardItemProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [error, setError] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [editPending, setEditPending] = useState(false);

  async function handleDelete() {
    setDeletePending(true);
    const result = await deleteCardAction({ cardId: card.id });
    setDeletePending(false);
    if (result.ok) {
      setDeleteOpen(false);
      router.refresh();
      toast.success("Card deleted successfully");
    } else {
      toast.error(result.error);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEditPending(true);
    const result = await updateCardAction({
      cardId: card.id,
      front,
      back,
    });
    setEditPending(false);
    if (result.ok) {
      setEditOpen(false);
      router.refresh();
      toast.success("Card updated successfully");
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{card.front}</CardTitle>
          <CardDescription>{card.back}</CardDescription>
          <CardAction className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => setEditOpen(true)}
              aria-label="Edit card"
            >
              <PencilIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
              aria-label="Delete card"
            >
              <Trash2Icon className="size-4" />
            </Button>
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete card?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this card from the deck.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deletePending}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    variant="destructive"
                    disabled={deletePending}
                    onClick={() => handleDelete()}
                  >
                    {deletePending ? "Deleting…" : "Delete"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardAction>
        </CardHeader>
      </Card>

      <Dialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) {
            setError(null);
            setFront(card.front);
            setBack(card.back);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit card</DialogTitle>
            <DialogDescription>
              Update the front and back text for this flash card.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4 pt-2 pb-0">
            <div className="grid gap-2">
              <Label htmlFor="edit-front">Front</Label>
              <Input
                id="edit-front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Question or term"
                disabled={editPending}
                aria-invalid={!!error}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-back">Back</Label>
              <Input
                id="edit-back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Answer or definition"
                disabled={editPending}
                aria-invalid={!!error}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <DialogFooter showCloseButton={false}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={editPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editPending}>
                {editPending ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
