"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getCardById } from "@/db/queries/cards";
import { getDeckById } from "@/db/queries/decks";
import { updateCard } from "@/db/queries/cards";

const UpdateCardSchema = z.object({
  cardId: z.coerce.number().int().positive(),
  front: z.string().min(1, "Front text is required").trim(),
  back: z.string().min(1, "Back text is required").trim(),
});

export type UpdateCardInput = z.infer<typeof UpdateCardSchema>;

export type UpdateCardResult =
  | { ok: true; error?: never }
  | { ok: false; error: string };

export async function updateCardAction(
  input: UpdateCardInput
): Promise<UpdateCardResult> {
  const parsed = UpdateCardSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const message =
      first.front?.[0] ?? first.back?.[0] ?? parsed.error.message;
    return { ok: false, error: message };
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

  await updateCard(parsed.data.cardId, {
    front: parsed.data.front,
    back: parsed.data.back,
  });
  return { ok: true };
}
