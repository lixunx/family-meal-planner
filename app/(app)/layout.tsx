import { LocaleProvider } from "@/components/locale-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { requireProfile } from "@/lib/auth";
import { t } from "@/lib/i18n";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();

  return (
    <LocaleProvider locale={profile.locale}>
      <div className="mx-auto min-h-dvh max-w-lg bg-stone-50 pb-24">
        <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur">
          <h1 className="text-lg font-semibold text-emerald-800">
            {t(profile.locale, "app.title")}
          </h1>
        </header>
        <main className="px-4 py-4">{children}</main>
        <BottomNav locale={profile.locale} />
      </div>
    </LocaleProvider>
  );
}
