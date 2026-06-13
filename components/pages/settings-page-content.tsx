"use client";

import { useState } from "react";
import { useAppData } from "@/components/app-data-provider";
import { MealConfigSection } from "@/components/settings/meal-config-section";
import { SettingsSubPage } from "@/components/settings/settings-sub-page";
import { SettingsView } from "@/components/settings/settings-view";
import { useT } from "@/components/locale-provider";
import { canEdit } from "@/lib/types";

type SettingsScreen = "main" | "meal-planning";

export function SettingsPageContent() {
  const tr = useT();
  const { profile, allowlist, mealConfig } = useAppData();
  const [screen, setScreen] = useState<SettingsScreen>("main");
  const editable = canEdit(profile.role);

  return (
    <div className="relative min-h-[calc(100dvh-9rem)]">
      <SettingsView
        profile={profile}
        allowlist={allowlist}
        onOpenMealPlanning={() => setScreen("meal-planning")}
      />

      {screen === "meal-planning" && (
        <SettingsSubPage
          title={tr("settings.mealConfig")}
          onBack={() => setScreen("main")}
        >
          <MealConfigSection config={mealConfig} editable={editable} />
        </SettingsSubPage>
      )}
    </div>
  );
}
