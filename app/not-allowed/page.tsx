import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NotAllowedPage() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?error=not_allowed");
}
