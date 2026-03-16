"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addCardAction } from "@/app/actions/add-card";

type AddCardDialogProps = {
  deckId: number;
};

export function AddCardDialog({ deckId }: AddCardDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await addCardAction({ deckId, front, back });
    setPending(false);
    if (result.ok) {
      setFront("");
      setBack("");
      setOpen(false);
      router.refresh();
      toast.success("Card added successfully");
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setError(null); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          + Add card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add card</DialogTitle>
          <DialogDescription>
            Enter the front and back text for your new flash card.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 pt-2 pb-0">
          <div className="grid gap-2">
            <Label htmlFor="front">Front</Label>
            <Input
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Question or term"
              disabled={pending}
              aria-invalid={!!error}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="back">Back</Label>
            <Input
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Answer or definition"
              disabled={pending}
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
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
