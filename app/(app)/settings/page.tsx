import { requireProfile } from "@/lib/auth";
import { fetchAllowlist } from "@/lib/data/settings";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const profile = await requireProfile();
  const allowlist = await fetchAllowlist();

  return <SettingsView profile={profile} allowlist={allowlist} />;
}
