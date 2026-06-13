"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";
import { generateRecommendationAction } from "@/app/actions/meals";

export function RefreshRecommendButton({
  existingPlanId,
}: {
  existingPlanId: string;
}) {
  const tr = useT();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleRefresh() {
    startTransition(async () => {
      await generateRecommendationAction(existingPlanId);
      setConfirming(false);
    });
  }

  if (!confirming) {
    return (
      <Button
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={() => setConfirming(true)}
      >
        <RefreshCw className="h-4 w-4" />
        {tr("meals.refreshRecommend")}
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-3">
      <p className="text-sm text-amber-900">{tr("meals.refreshWarning")}</p>
      <div className="flex gap-2">
        <Button
          className="flex-1"
          size="sm"
          disabled={pending}
          onClick={handleRefresh}
        >
          {tr("meals.refreshConfirm")}
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          size="sm"
          disabled={pending}
          onClick={() => setConfirming(false)}
        >
          {tr("common.cancel")}
        </Button>
      </div>
    </div>
  );
}
