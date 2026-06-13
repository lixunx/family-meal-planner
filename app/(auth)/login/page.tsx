"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setAuthError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) {
      setAuthError(oauthError.message);
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-emerald-800">Meal Planner</CardTitle>
        <p className="text-sm text-stone-500">家庭餐单</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full"
          size="lg"
          onClick={signInWithGoogle}
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign in with Google"}
        </Button>
        {(error === "not_allowed" || error === "auth") && (
          <p className="text-center text-sm text-red-600">
            {error === "not_allowed"
              ? "Your email is not on the family allowlist."
              : "Sign in failed. Please try again."}
          </p>
        )}
        {authError && (
          <p className="text-center text-sm text-red-600">{authError}</p>
        )}
        <Link href="/guest/meals" className="block">
          <Button variant="outline" className="w-full" size="lg">
            <Eye className="h-4 w-4" />
            View meals & inventory
          </Button>
        </Link>
        <p className="text-center text-xs text-stone-500">
          无需登录 · No sign-in needed
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-stone-50 p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
