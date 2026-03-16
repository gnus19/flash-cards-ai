"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getDeckById } from "@/db/queries/decks";
import { updateDeck } from "@/db/queries/decks";

const UpdateDeckSchema = z.object({
  deckId: z.coerce.number().int().positive(),
  name: z.string().min(1, "Title is required").trim(),
  description: z.string().trim().transform((s) => s || null),
});

export type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;

export type UpdateDeckResult =
  | { ok: true; error?: never }
  | { ok: false; error: string };

export async function updateDeckAction(
  input: UpdateDeckInput
): Promise<UpdateDeckResult> {
  const parsed = UpdateDeckSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const message =
      first.name?.[0] ?? first.description?.[0] ?? parsed.error.message;
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

  await updateDeck(userId, parsed.data.deckId, {
    name: parsed.data.name,
    description: parsed.data.description,
  });
  return { ok: true };
}
