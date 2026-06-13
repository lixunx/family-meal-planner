import { LocaleProvider } from "@/components/locale-provider";
import Link from "next/link";
import { GuestBottomNav } from "@/components/layout/guest-bottom-nav";
import { DEFAULT_LOCALE } from "@/lib/constants";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider locale={DEFAULT_LOCALE}>
      <div className="mx-auto min-h-dvh max-w-lg bg-stone-50 pb-24">
        <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-emerald-800">家庭餐单</h1>
            <Link
              href="/login"
              className="text-xs font-medium text-emerald-700 underline"
            >
              登录
            </Link>
          </div>
          <p className="mt-0.5 text-xs text-stone-500">只读 · Read only</p>
        </header>
        <main className="px-4 py-4">{children}</main>
        <GuestBottomNav />
      </div>
    </LocaleProvider>
  );
}
