"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getDeckById, deleteDeck } from "@/db/queries/decks";

const DeleteDeckSchema = z.object({
  deckId: z.coerce.number().int().positive(),
});

export type DeleteDeckInput = z.infer<typeof DeleteDeckSchema>;

export type DeleteDeckResult =
  | { ok: true; error?: never }
  | { ok: false; error: string };

export async function deleteDeckAction(
  input: DeleteDeckInput
): Promise<DeleteDeckResult> {
  const parsed = DeleteDeckSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid deck" };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Unauthorized" };
  }

  const deck = await getDeckById(userId, parsed.data.deckId);
  if (!deck) {
    return { ok: false, error: "Deck not found" };
  }

  await deleteDeck(userId, parsed.data.deckId);
  return { ok: true };
}
