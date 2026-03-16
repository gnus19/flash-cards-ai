"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateCardsAction } from "@/app/actions/generate-cards";
import { toast } from "sonner";

type GenerateWithAIButtonProps = {
  deckId: number;
  canUseAI: boolean;
  hasDescription: boolean;
};

export function GenerateWithAIButton({ deckId, canUseAI, hasDescription }: GenerateWithAIButtonProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerate = canUseAI && hasDescription;

  async function handleClick() {
    if (!canUseAI) {
      router.push("/pricing");
      return;
    }
    if (!hasDescription) {
      return;
    }
    setIsGenerating(true);
    const result = await generateCardsAction({ deckId });
    setIsGenerating(false);
    if (result.ok) {
      toast.success(`${result.count} cards generated with AI`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const button = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isGenerating || (canUseAI && !hasDescription)}
    >
      <Sparkles className="mr-2 h-4 w-4" />
      {isGenerating ? "Generating…" : "Generate with AI"}
    </Button>
  );

  if (canGenerate) {
    return button;
  }

  const tooltipMessage = !canUseAI
    ? "AI generation is a paid feature. Upgrade to Pro to generate flashcards from your deck."
    : "Add a description to your deck first to generate cards with AI.";

  const isDisabled = canUseAI && !hasDescription;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {isDisabled ? (
          <span className="inline-flex cursor-not-allowed">
            {button}
          </span>
        ) : (
          button
        )}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <p>{tooltipMessage}</p>
      </TooltipContent>
    </Tooltip>
  );
}
