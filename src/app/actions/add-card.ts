"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getDeckById } from "@/db/queries/decks";
import { insertCard } from "@/db/queries/cards";

const AddCardSchema = z.object({
  deckId: z.coerce.number().int().positive(),
  front: z.string().min(1, "Front text is required").trim(),
  back: z.string().min(1, "Back text is required").trim(),
});

export type AddCardInput = z.infer<typeof AddCardSchema>;

export type AddCardResult =
  | { ok: true; error?: never }
  | { ok: false; error: string };

export async function addCardAction(
  input: AddCardInput
): Promise<AddCardResult> {
  const parsed = AddCardSchema.safeParse(input);
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

  const deck = await getDeckById(userId, parsed.data.deckId);
  if (!deck) {
    return { ok: false, error: "Deck not found" };
  }

  await insertCard(
    parsed.data.deckId,
    parsed.data.front,
    parsed.data.back
  );
  return { ok: true };
}
