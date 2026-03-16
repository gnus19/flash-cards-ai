import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center justify-center gap-8 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Flash Cards Decks
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your personal flashcard platform
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <SignInButton
            mode="modal"
            forceRedirectUrl="/dashboard"
            signUpForceRedirectUrl="/dashboard"
          >
            <Button className="rounded-full px-8" variant="outline">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <Button className="rounded-full px-8" variant="default">
              Sign up
            </Button>
          </SignUpButton>
        </div>
      </main>
    </div>
  );
}
