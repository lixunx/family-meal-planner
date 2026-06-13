"use client";

import { useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/components/app-data-provider";
import { useT } from "@/components/locale-provider";
import { generateRecommendationAction } from "@/app/actions/meals";

export function RecommendButton({
  existingPlanId,
}: {
  existingPlanId?: string;
}) {
  const tr = useT();
  const { refreshMeals } = useAppData();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      className="w-full"
      size="lg"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await generateRecommendationAction(existingPlanId);
          await refreshMeals();
        })
      }
    >
      <Sparkles className="h-4 w-4" />
      {pending ? tr("common.loading") : tr("meals.generate")}
    </Button>
  );
}
