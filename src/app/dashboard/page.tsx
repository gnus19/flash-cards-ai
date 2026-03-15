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

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const decks = await getUserDecks(userId);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center justify-center gap-6 text-center px-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400 max-w-xl">
            View and manage your flash card decks once you are signed in.
          </p>
        </div>

        <Show when="signed-in">
          <div className="mt-4 w-full max-w-5xl rounded-2xl border border-black/[0.06] bg-white/80 p-6 text-left shadow-sm backdrop-blur dark:border-white/[0.12] dark:bg-zinc-900/80">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              Your decks
            </h2>

            {decks.length === 0 ? (
              <>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  You don&apos;t have any decks yet. This area will show your
                  decks, progress, and study stats once they are created.
                </p>
                <div className="mt-4 flex justify-center">
                  <Button variant="outline">+ create deck</Button>
                </div>
              </>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {decks.map((deck) => (
                  <Card key={deck.id}>
                    <CardHeader>
                      <CardTitle>{deck.name}</CardTitle>
                      {deck.description && (
                        <CardDescription>{deck.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardFooter>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Updated{" "}
                        {new Date(deck.updatedAt as unknown as string).toLocaleDateString()}
                      </span>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Show>
      </main>
    </div>
  );
}

