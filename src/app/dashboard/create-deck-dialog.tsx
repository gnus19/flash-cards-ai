"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { createDeckAction } from "@/app/actions/create-deck";

type CreateDeckDialogProps = {
  /** Optional. If true, render only an icon button (for next to heading). If false/undefined, render button with "Create deck" text (e.g. empty state). */
  iconOnly?: boolean;
};

export function CreateDeckDialog({ iconOnly = true }: CreateDeckDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await createDeckAction({ name, description });
    setPending(false);
    if (result.ok) {
      setOpen(false);
      setName("");
      setDescription("");
      router.refresh();
      toast.success("Deck created successfully");
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  }

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) {
      setError(null);
      if (!pending) {
        setName("");
        setDescription("");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {iconOnly ? (
          <Button variant="outline" size="icon" aria-label="Create new deck">
            <PlusIcon className="size-4" />
          </Button>
        ) : (
          <Button variant="outline">+ create deck</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create deck</DialogTitle>
          <DialogDescription>
            Add a new flash card deck. You can add cards after creating it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 pt-2 pb-0">
          <div className="grid gap-2">
            <Label htmlFor="new-deck-name">Title</Label>
            <Input
              id="new-deck-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Deck name"
              disabled={pending}
              aria-invalid={!!error}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-deck-description">Description (optional)</Label>
            <Textarea
              id="new-deck-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this deck"
              disabled={pending}
              rows={3}
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
              {pending ? "Creating…" : "Create deck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
