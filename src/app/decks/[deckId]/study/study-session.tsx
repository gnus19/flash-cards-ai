"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type StudyCard = { id: number; front: string; back: string };

type StudySessionProps = {
  deckId: number;
  cards: StudyCard[];
};

function shuffle<T>(array: T[]): T[] {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function StudySession({ deckId, cards }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const shuffledCards = useMemo(() => shuffle(cards), [cards]);
  const currentCard = shuffledCards[currentIndex];
  const total = shuffledCards.length;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < total - 1;
  const progressValue = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  const goPrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
    setIsFlipped(false);
  };

  const goNext = () => {
    setCurrentIndex((i) => Math.min(total - 1, i + 1));
    setIsFlipped(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {total}
          </p>
          <p className="text-sm text-muted-foreground">
            Correct: {correctCount} · Incorrect: {incorrectCount}
          </p>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      <button
        type="button"
        onClick={() => setIsFlipped((f) => !f)}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      >
        <Card className="min-h-[220px] cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 active:scale-[0.99]">
          <CardContent className="flex flex-col items-center justify-center p-8 min-h-[220px]">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
              {isFlipped ? "Answer" : "Question"}
            </span>
            <p className="text-lg text-center text-foreground whitespace-pre-wrap">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Click card to flip
            </p>
          </CardContent>
        </Card>
      </button>

      {isFlipped && (
        <div className="flex w-full gap-2">
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => setIncorrectCount((c) => c + 1)}
            aria-label="Mark incorrect"
          >
            <X className="size-4" />
            Incorrect
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-green-600/50 bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:border-green-500/50 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30"
            onClick={() => setCorrectCount((c) => c + 1)}
            aria-label="Mark correct"
          >
            <Check className="size-4" />
            Correct
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Previous card"
        >
          ← Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsFlipped((f) => !f)}
          aria-label={isFlipped ? "Show question" : "Show answer"}
        >
          {isFlipped ? "Show question" : "Show answer"}
        </Button>
        <Button
          variant="outline"
          onClick={goNext}
          disabled={!canGoNext}
          aria-label="Next card"
        >
          Next →
        </Button>
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/decks/${deckId}`}>Done studying</Link>
        </Button>
      </div>
    </div>
  );
}
