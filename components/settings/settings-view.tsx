"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronRight, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/components/locale-provider";
import {
  addFamilyMemberAction,
  removeFamilyMemberAction,
  signOutAction,
  updateSettingsAction,
} from "@/app/actions/settings";
import { LOCALES, TIMEZONES, roleLabel } from "@/lib/i18n";
import type { FamilyAllowlist, Locale, Profile } from "@/lib/types";
import { USER_ROLES, canManageFamily } from "@/lib/types";

export function SettingsView({
  profile,
  allowlist,
  onOpenMealPlanning,
}: {
  profile: Profile;
  allowlist: FamilyAllowlist[];
  onOpenMealPlanning: () => void;
}) {
  const tr = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [locale, setLocale] = useState(profile.locale);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [memberRole, setMemberRole] = useState("viewer");
  const isAdmin = canManageFamily(profile.role);

  function saveSettings() {
    const formData = new FormData();
    formData.set("locale", locale);
    formData.set("timezone", timezone);
    startTransition(async () => {
      await updateSettingsAction(formData);
      router.refresh();
    });
  }

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tr("settings.profile")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="font-medium">{profile.display_name ?? profile.email}</p>
          <p className="text-stone-500">{profile.email}</p>
          <p className="text-stone-500">
            {roleLabel(profile.locale, profile.role)}
          </p>
          {profile.role === "viewer" && (
            <p className="text-amber-600">{tr("settings.readOnly")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tr("settings.language")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{tr("settings.language")}</Label>
            <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{tr("settings.timezone")}</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={saveSettings} disabled={pending}>
            {tr("common.save")}
          </Button>
        </CardContent>
      </Card>

      <button type="button" onClick={onOpenMealPlanning} className="w-full text-left">
        <Card className="transition-colors active:bg-stone-50">
          <CardContent className="flex items-center justify-between gap-3 py-4">
            <p className="text-sm font-medium">{tr("settings.mealConfig")}</p>
            <ChevronRight className="h-5 w-5 shrink-0 text-stone-400" />
          </CardContent>
        </Card>
      </button>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tr("settings.family")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {allowlist.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{member.email}</p>
                    <p className="text-stone-500">
                      {roleLabel(profile.locale, member.role)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-stone-400 hover:text-red-600"
                    onClick={() =>
                      startTransition(() => {
                        void removeFamilyMemberAction(member.id);
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>

            <form
              action={(formData) =>
                startTransition(() => {
                  void addFamilyMemberAction(formData);
                })
              }
              className="space-y-3 border-t border-stone-100 pt-4"
            >
              <Label>{tr("settings.addMember")}</Label>
              <Input
                name="email"
                type="email"
                placeholder={tr("settings.email")}
                required
              />
              <input type="hidden" name="role" value={memberRole} />
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabel(profile.locale, role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" variant="secondary" className="w-full">
                {tr("settings.addMember")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" className="w-full" onClick={handleSignOut}>
        <LogOut className="h-4 w-4" />
        {tr("settings.signOut")}
      </Button>
    </div>
  );
}
