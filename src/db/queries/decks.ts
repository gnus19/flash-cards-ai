import { db, schema } from "@/db";

export async function getUserDecks(userId: string) {
  return db.query.decks.findMany({
    where: (decks, { eq }) => eq(decks.userId, userId),
    orderBy: (decks, { desc }) => [desc(decks.updatedAt)],
  });
}

