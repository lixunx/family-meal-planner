"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SettingsSubPage({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  function handleBack() {
    setClosing(true);
    window.setTimeout(onBack, 280);
  }

  return (
    <div
      className={`absolute inset-0 z-20 overflow-y-auto bg-stone-50 transition-transform duration-300 ease-out ${
        visible && !closing ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-stone-200 bg-white/95 px-1 py-2 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-base font-semibold text-emerald-800">{title}</h2>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}
