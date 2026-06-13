import { redirect } from "next/navigation";
import type { Locale, Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}

export async function getLocale(): Promise<Locale> {
  const profile = await getProfile();
  return profile?.locale ?? "zh-CN";
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) {
    redirect("/not-allowed");
  }
  return profile;
}
