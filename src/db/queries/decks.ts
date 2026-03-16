import { eq, and, count } from "drizzle-orm";
import { db } from "@/db";
import { decks } from "@/db/schema";

export async function getUserDeckCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(decks)
    .where(eq(decks.userId, userId));
  return row?.count ?? 0;
}

export async function getUserDecks(userId: string) {
  return db.query.decks.findMany({
    where: (decks, { eq }) => eq(decks.userId, userId),
    orderBy: (decks, { desc }) => [desc(decks.updatedAt)],
  });
}

export async function createDeck(
  userId: string,
  data: { name: string; description: string | null }
) {
  const [deck] = await db
    .insert(decks)
    .values({
      userId,
      name: data.name,
      description: data.description,
    })
    .returning();
  return deck ?? null;
}

export async function getDeckById(userId: string, deckId: number) {
  const [deck] = await db.query.decks.findMany({
    where: (decks, { eq, and }) =>
      and(eq(decks.id, deckId), eq(decks.userId, userId)),
  });
  return deck ?? null;
}

export async function updateDeck(
  userId: string,
  deckId: number,
  data: { name: string; description: string | null }
) {
  const [updated] = await db
    .update(decks)
    .set({
      name: data.name,
      description: data.description,
      updatedAt: new Date(),
    })
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .returning();
  return updated ?? null;
}

export async function deleteDeck(userId: string, deckId: number) {
  const [deleted] = await db
    .delete(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .returning();
  return deleted ?? null;
}

