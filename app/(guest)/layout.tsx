import { GuestDataProvider } from "@/components/guest-data-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { GuestBottomNav } from "@/components/layout/guest-bottom-nav";
import { GuestHeader } from "@/components/layout/guest-header";
import { GUEST_DEFAULT_LOCALE } from "@/lib/constants";
import {
  fetchGuestInventory,
  fetchGuestMealHistory,
  fetchGuestTomorrowPlan,
} from "@/lib/data/guest";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tomorrowPlan, history, inventory] = await Promise.all([
    fetchGuestTomorrowPlan(),
    fetchGuestMealHistory(),
    fetchGuestInventory(),
  ]);

  return (
    <GuestDataProvider
      initial={{
        tomorrowPlan,
        history,
        inventory,
      }}
    >
      <LocaleProvider locale={GUEST_DEFAULT_LOCALE} allowToggle>
        <div className="mx-auto min-h-dvh max-w-lg bg-stone-50 pb-24">
          <GuestHeader />
          <main className="px-4 py-4">{children}</main>
          <GuestBottomNav />
        </div>
      </LocaleProvider>
    </GuestDataProvider>
  );
}
