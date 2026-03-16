import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Show } from "@clerk/nextjs";
import { getUserDecks } from "@/db/queries/decks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateDeckDialog } from "@/app/dashboard/create-deck-dialog";

const FREE_DECK_LIMIT = 3;

export default async function DashboardPage() {
  const { userId, has } = await auth();

  if (!userId) {
    redirect("/");
  }

  const decks = await getUserDecks(userId);
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  const canCreateDeck = hasUnlimitedDecks || decks.length < FREE_DECK_LIMIT;
  const planLabel = has({ plan: "pro" }) ? "Pro" : "Free";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex w-full max-w-5xl flex-col gap-6 px-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="text-left">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-xl">
              View and manage your flash card decks once you are signed in.
            </p>
          </div>
          <Badge variant="secondary">
            {planLabel} Plan – {decks.length} deck{decks.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <Show when="signed-in">
          <div className="mt-4 w-full max-w-5xl rounded-2xl border border-border bg-card p-6 text-left shadow-sm text-card-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">
                Your decks
              </h2>
              {canCreateDeck ? (
                <CreateDeckDialog iconOnly />
              ) : (
                <span className="text-sm text-muted-foreground">
                  Free plan limited to {FREE_DECK_LIMIT} decks.{" "}
                  <Link
                    href="/pricing"
                    className="font-medium text-primary underline underline-offset-4 hover:no-underline"
                  >
                    Upgrade to Pro
                  </Link>
                </span>
              )}
            </div>

            {decks.length === 0 ? (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  You don&apos;t have any decks yet. This area will show your
                  decks, progress, and study stats once they are created.
                </p>
                <div className="mt-4 flex flex-col items-center gap-2">
                  {canCreateDeck ? (
                    <CreateDeckDialog iconOnly={false} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Free plan limited to {FREE_DECK_LIMIT} decks.{" "}
                      <Link
                        href="/pricing"
                        className="font-medium text-primary underline underline-offset-4 hover:no-underline"
                      >
                        Upgrade to Pro for unlimited decks
                      </Link>
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {decks.map((deck) => (
                  <Link key={deck.id} href={`/decks/${deck.id}`}>
                    <Card className="transition-colors hover:bg-muted/50 cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle>{deck.name}</CardTitle>
                        {deck.description && (
                          <CardDescription>{deck.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardFooter>
                        <span className="text-xs text-muted-foreground">
                          Updated{" "}
                          {new Date(deck.updatedAt as unknown as string).toLocaleDateString()}
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Show>
      </main>
    </div>
  );
}

