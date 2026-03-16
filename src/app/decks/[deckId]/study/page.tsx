import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StudySession } from "./study-session";

type PageProps = {
  params: Promise<{ deckId: string }>;
};

export default async function StudyPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { deckId: deckIdParam } = await params;
  const deckId = Number(deckIdParam);
  if (Number.isNaN(deckId)) {
    notFound();
  }

  const deck = await getDeckById(userId, deckId);
  if (!deck) {
    notFound();
  }

  const cards = await getCardsByDeckId(deckId);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/decks/${deckId}`}>← Back to deck</Link>
          </Button>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Study: {deck.name}
          </h1>
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-8 text-muted-foreground">
                No cards in this deck yet. Add cards to start studying.
              </p>
              <div className="flex justify-center pb-6">
                <Button asChild>
                  <Link href={`/decks/${deckId}`}>Back to deck</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <StudySession
            deckId={deckId}
            cards={cards.map((c) => ({ id: c.id, front: c.front, back: c.back }))}
          />
        )}
      </main>
    </div>
  );
}
