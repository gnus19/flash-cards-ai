"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getCardById } from "@/db/queries/cards";
import { getDeckById } from "@/db/queries/decks";
import { deleteCard } from "@/db/queries/cards";

const DeleteCardSchema = z.object({
  cardId: z.coerce.number().int().positive(),
});

export type DeleteCardInput = z.infer<typeof DeleteCardSchema>;

export type DeleteCardResult =
  | { ok: true; error?: never }
  | { ok: false; error: string };

export async function deleteCardAction(
  input: DeleteCardInput
): Promise<DeleteCardResult> {
  const parsed = DeleteCardSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid card" };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Unauthorized" };
  }

  const card = await getCardById(parsed.data.cardId);
  if (!card) {
    return { ok: false, error: "Card not found" };
  }

  const deck = await getDeckById(userId, card.deckId);
  if (!deck) {
    return { ok: false, error: "Deck not found" };
  }

  await deleteCard(parsed.data.cardId);
  return { ok: true };
}
