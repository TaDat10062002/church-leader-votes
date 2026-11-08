"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Church, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import { GlassChip } from "@/components/ui/glass-chip";
import { ThemeControl } from "@/components/theme/theme-control";
import { useLocale } from "@/components/locale/locale-provider";
import { apiErrorMessage } from "@/lib/i18n";

export default function AdminLoginPage() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(""); setBusy(true);
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ passcode: pin }) });
      const data = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(locale, data.code));
      router.push("/dashboard");
    } catch (e) { setError(e instanceof Error ? e.message : t("cannotLogin")); }
    finally { setBusy(false); }
  }
  return <main className="relative grid min-h-dvh place-items-center px-4 py-10">
    <ThemeControl className="theme-control--floating" />
    <Card className="w-full max-w-md p-7 sm:p-9">
      <GlassChip className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full text-moss"><Church size={25} aria-hidden="true"/></GlassChip>
      <p className="text-center text-xs font-bold uppercase tracking-[.22em] text-moss">{t("adminTitle")}</p>
      <h1 className="mt-2 text-center text-2xl font-semibold text-ink">{t("pinHeading")}</h1>
      <p className="mt-2 text-center text-sm text-ink/75">{t("pinDescription")}</p>
      <form onSubmit={submit} className="mt-7 space-y-4" aria-busy={busy}>
        <FormInput icon={<KeyRound size={18}/>} autoComplete="one-time-code" inputMode="numeric" type="password" value={pin} onChange={(e) => setPin(e.target.value)} disabled={busy} inputClassName="py-1 text-center tracking-[.4em]" placeholder="••••" aria-label={t("pinLabel")} required />
        {error && <p role="alert" className="rounded-xl bg-[var(--app-danger-bg)] px-4 py-3 text-sm text-[var(--app-danger)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy} aria-busy={busy}>{busy ? t("authenticating") : t("adminEnter")}<ArrowRight size={16} aria-hidden="true"/></Button>
      </form>
      <a href="/vote" className="mt-5 block text-center text-sm text-ink/75 hover:text-ink">{t("backToVote")}</a>
    </Card>
  </main>;
}
