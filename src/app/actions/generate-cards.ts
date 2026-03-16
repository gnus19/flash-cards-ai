"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { generateText, Output } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getDeckById } from "@/db/queries/decks";
import { insertCards } from "@/db/queries/cards";

const GenerateCardsSchema = z.object({
  deckId: z.coerce.number().int().positive(),
});

export type GenerateCardsInput = z.infer<typeof GenerateCardsSchema>;

export type GenerateCardsResult =
  | { ok: true; count: number; error?: never }
  | { ok: false; error: string };

const CARD_COUNT = 20;

export async function generateCardsAction(
  input: GenerateCardsInput
): Promise<GenerateCardsResult> {
  const parsed = GenerateCardsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid deck" };
  }

  const { userId, has } = await auth();
  if (!userId) {
    return { ok: false, error: "Unauthorized" };
  }

  if (!has({ feature: "ai_flashcard_generation" })) {
    return { ok: false, error: "AI flashcard generation is a Pro feature. Upgrade to unlock." };
  }

  const deck = await getDeckById(userId, parsed.data.deckId);
  if (!deck) {
    return { ok: false, error: "Deck not found" };
  }

  const description = deck.description?.trim();
  if (!description) {
    return { ok: false, error: "Please add a description to your deck first to generate cards with AI." };
  }

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const topic = `${deck.name}. ${description}`;

  try {
    const { output } = await generateText({
      model: openai("gpt-4o-mini"),
      output: Output.object({
        name: "Flashcards",
        description: "Array of flashcards with front and back.",
        schema: z.object({
          cards: z.array(
            z.object({
              front: z.string().describe("Question or term on the front of the card"),
              back: z.string().describe("Answer or definition on the back of the card"),
            })
          ),
        }),
      }),
      prompt: `Generate exactly ${CARD_COUNT} flashcards about the following topic. Each card must have a clear front (question or term) and back (answer or definition). Return exactly ${CARD_COUNT} cards. Topic: ${topic}`,
    });

    const cards = output.cards ?? [];
    if (cards.length === 0) {
      return { ok: false, error: "No cards were generated. Try again." };
    }

    await insertCards(parsed.data.deckId, cards.slice(0, CARD_COUNT));
    return { ok: true, count: Math.min(cards.length, CARD_COUNT) };
  } catch (err) {
    console.error("AI generate cards error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to generate cards. Try again.",
    };
  }
}
