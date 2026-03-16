import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cards } from "@/db/schema";

export async function getCardsByDeckId(deckId: number) {
  return db.query.cards.findMany({
    where: (cards, { eq }) => eq(cards.deckId, deckId),
    orderBy: (cards, { desc }) => [desc(cards.updatedAt)],
  });
}

export async function getCardById(cardId: number) {
  const [card] = await db.query.cards.findMany({
    where: (cards, { eq }) => eq(cards.id, cardId),
  });
  return card ?? null;
}

export async function insertCard(deckId: number, front: string, back: string) {
  const [card] = await db
    .insert(cards)
    .values({ deckId, front, back })
    .returning();
  return card;
}

export async function insertCards(
  deckId: number,
  items: Array<{ front: string; back: string }>
) {
  if (items.length === 0) return [];
  const values = items.map(({ front, back }) => ({ deckId, front, back }));
  return db.insert(cards).values(values).returning();
}

export async function updateCard(
  cardId: number,
  data: { front: string; back: string }
) {
  const [card] = await db
    .update(cards)
    .set({ front: data.front, back: data.back, updatedAt: new Date() })
    .where(eq(cards.id, cardId))
    .returning();
  return card ?? null;
}

export async function deleteCard(cardId: number) {
  const [card] = await db
    .delete(cards)
    .where(eq(cards.id, cardId))
    .returning();
  return card ?? null;
}
