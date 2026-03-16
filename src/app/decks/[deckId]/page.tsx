import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddCardDialog } from "./add-card-dialog";
import { EditDeckDialog } from "./edit-deck-dialog";
import { DeleteDeckDialog } from "./delete-deck-dialog";
import { CardItem } from "./card-item";
import { GenerateWithAIButton } from "./generate-with-ai-button";

type PageProps = {
  params: Promise<{ deckId: string }>;
};

export default async function DeckPage({ params }: PageProps) {
  const { userId, has } = await auth();

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
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">← Back to dashboard</Link>
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {deck.name}
            </h1>
            <div className="flex items-center gap-2">
              <EditDeckDialog
                deckId={deckId}
                initialName={deck.name}
                initialDescription={deck.description}
              />
              <DeleteDeckDialog deckId={deckId} deckName={deck.name} />
            </div>
          </div>
          {deck.description && (
            <p className="mt-2 text-muted-foreground">{deck.description}</p>
          )}
          <Badge variant="outline" className="mt-2">
            Updated{" "}
            {new Date(deck.updatedAt as unknown as string).toLocaleDateString()}
          </Badge>
          {cards.length > 0 && (
            <Button asChild className="mt-4 w-full">
              <Link href={`/decks/${deckId}/study`}>Study</Link>
            </Button>
          )}
        </div>

        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Cards ({cards.length})
            </h2>
            <div className="flex items-center gap-2">
              <GenerateWithAIButton
                deckId={deckId}
                canUseAI={has({ feature: "ai_flashcard_generation" })}
                hasDescription={Boolean(deck.description?.trim())}
              />
              <AddCardDialog deckId={deckId} />
            </div>
          </div>

          {cards.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  No cards in this deck yet. Add cards to start studying.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {cards.map((card) => (
                <li key={card.id}>
                  <CardItem card={card} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
