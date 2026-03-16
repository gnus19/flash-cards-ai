"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createDeck, getUserDeckCount } from "@/db/queries/decks";

const CreateDeckSchema = z.object({
  name: z.string().min(1, "Title is required").trim(),
  description: z.string().trim().transform((s) => s || null),
});

export type CreateDeckInput = z.infer<typeof CreateDeckSchema>;

export type CreateDeckResult =
  | { ok: true; error?: never }
  | { ok: false; error: string };

export async function createDeckAction(
  input: CreateDeckInput
): Promise<CreateDeckResult> {
  const parsed = CreateDeckSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const message =
      first.name?.[0] ?? first.description?.[0] ?? parsed.error.message;
    return { ok: false, error: message };
  }

  const { userId, has } = await auth();
  if (!userId) {
    return { ok: false, error: "Unauthorized" };
  }

  if (!has({ feature: "unlimited_decks" })) {
    const deckCount = await getUserDeckCount(userId);
    if (deckCount >= 3) {
      return {
        ok: false,
        error: "Free plan is limited to 3 decks. Upgrade to Pro for unlimited decks.",
      };
    }
  }

  const deck = await createDeck(userId, {
    name: parsed.data.name,
    description: parsed.data.description,
  });
  if (!deck) {
    return { ok: false, error: "Failed to create deck" };
  }
  return { ok: true };
}
