import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const decks = pgTable("decks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  // Clerk user ID of the deck owner
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const cards = pgTable("cards", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
  .defaultNow()
  .notNull(),
});
