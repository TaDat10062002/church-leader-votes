"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Church,
  LogOut,
  RefreshCw,
  Trash2,
  Users,
  Vote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GlassChip } from "@/components/ui/glass-chip";
import { GlassHeader } from "@/components/ui/glass-header";
import {
  DashboardChartOrientationSwitch,
  DashboardResultsChart,
  type DashboardChartOrientation,
} from "@/components/dashboard-results-chart";
import type { ResultRow } from "@/lib/types";
import { shouldRefreshResults } from "@/lib/results";
import { useLocale } from "@/components/locale/locale-provider";
import { candidateName } from "@/lib/candidate-name";
import { apiErrorMessage } from "@/lib/i18n";
import Image from "next/image";

type Results = { election: { id: string } | null; results: ResultRow[] };

export default function Dashboard() {
  const router = useRouter();
  const { locale, t, number, time } = useLocale();
  const localeRef = useRef(locale);
  const translateRef = useRef(t);
  localeRef.current = locale;
  translateRef.current = t;
  const [data, setData] = useState<Results>({ election: null, results: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState("");
  const [chartOrientation, setChartOrientation] =
    useState<DashboardChartOrientation>("vertical");
  const resetDialog = useRef<HTMLDialogElement>(null);
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createClient(url, key) : null;
  }, []);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/results", { cache: "no-store" });
      const json = await response.json();
      if (response.status === 401) {
        router.replace("/vote");
        return;
      }
      if (!response.ok)
        throw new Error(apiErrorMessage(localeRef.current, json.code));
      setData(json);
      setError("");
      setUpdated(new Date());
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : translateRef.current("cannotLoadResults"),
      );
    } finally {
      setLoading(false);
    }
  }, [router]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    const dialog = resetDialog.current;
    if (!dialog) return;
    if (resetOpen && !dialog.open) dialog.showModal();
    else if (!resetOpen && dialog.open) dialog.close();
  }, [resetOpen]);
  useEffect(() => {
    if (!data.election || !supabase) return;
    const channel = supabase
      .channel(`election-${data.election.id}`)
      .on("broadcast", { event: "vote-recorded" }, () => {
        if (shouldRefreshResults("vote-recorded")) void refresh();
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && shouldRefreshResults("subscribed"))
          void refresh();
      });
    const onFocus = () => {
      if (shouldRefreshResults("focus")) void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      void supabase.removeChannel(channel);
    };
  }, [data.election?.id, refresh, supabase]);
  const totalSelections = data.results.reduce((sum, row) => sum + row.total, 0);

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/vote");
  }
  async function confirmReset() {
    setResetBusy(true);
    setResetError("");
    try {
      const response = await fetch("/api/admin/reset", { method: "POST" });
      const result = (await response.json().catch(() => null)) as {
        code?: string;
      } | null;
      if (response.status === 401) {
        router.replace("/vote");
        return;
      }
      if (!response.ok)
        throw new Error(
          apiErrorMessage(locale, result?.code || "ELECTION_RESET_FAILED"),
        );
      setData({ election: null, results: [] });
      setUpdated(null);
      setResetOpen(false);
      router.replace("/import-file");
    } catch (e) {
      setResetError(e instanceof Error ? e.message : t("cannotResetElection"));
    } finally {
      setResetBusy(false);
    }
  }
  return (
    <main className="mx-auto min-h-dvh max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <GlassHeader className="flex flex-nowrap items-center justify-between gap-2 sm:flex-wrap sm:gap-3">
        <a
          href="/dashboard"
          aria-label={t("dashboard")}
          className="flex shrink-0 items-center gap-2 sm:gap-3"
        >
          <GlassChip className="grid size-9 shrink-0 place-items-center rounded-full bg-moss/10 text-moss sm:size-10">
            <Church size={19} />
          </GlassChip>
          <span className="hidden sm:block">
            <span className="block text-sm font-semibold text-ink">
              {t("dashboard")}
            </span>
            <span className="block text-[11px] text-ink/65">
              {t("liveResults")}
            </span>
          </span>
        </a>
        <div className="flex shrink-0 flex-nowrap justify-end gap-1 sm:gap-2">
          <Button
            variant="danger"
            aria-label={t("rerunElection")}
            onClick={() => {
              setResetError("");
              setResetOpen(true);
            }}
            aria-haspopup="dialog"
            className="min-h-0 size-10 rounded-full p-0 sm:min-h-11 sm:size-auto sm:rounded-2xl sm:px-5"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">{t("rerunElection")}</span>
          </Button>
          <Button
            variant="secondary"
            aria-label={t("candidateList")}
            onClick={() => router.push("/import-file")}
            className="min-h-0 size-10 rounded-full p-0 sm:min-h-11 sm:size-auto sm:rounded-2xl sm:px-5"
          >
            <Users size={16} />
            <span className="hidden sm:inline">{t("candidateListShort")}</span>
          </Button>
          <Button
            variant="ghost"
            onClick={logout}
            aria-label={t("logout")}
            className="min-h-0 size-10 rounded-full p-0 sm:min-h-11 sm:size-auto sm:rounded-2xl sm:px-5"
          >
            <LogOut size={17} />
            <span className="hidden sm:inline">{t("logout")}</span>
          </Button>
        </div>
      </GlassHeader>
      <section className="mt-8 flex flex-col justify-between gap-4 sm:mt-12 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-moss">
            {t("inProgress")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t("voteSummary")}
          </h1>
          <p className="mt-2 text-sm text-ink/65">{t("chartAutoUpdate")}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink/65">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-moss" />
          </span>
          {updated ? t("updatedAt", { time: time(updated) }) : t("connecting")}
          <Button
            variant="ghost"
            onClick={refresh}
            className="size-11 rounded-full p-0"
            aria-label={t("reloadResults")}
          >
            <RefreshCw size={15} />
          </Button>
        </div>
      </section>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-[var(--app-danger-bg)] px-4 py-3 text-sm text-[var(--app-danger)]"
        >
          {error}
        </p>
      )}
      {loading ? (
        <Card className="mt-8 grid min-h-80 place-items-center text-moss">
          <RefreshCw className="animate-spin" />
        </Card>
      ) : !data.election ? (
        <Card glassVariant="frosted" className="mt-8 p-8 text-center">
          <p className="font-semibold">{t("noOpenElection")}</p>
          <Button className="mt-4" onClick={() => router.push("/import-file")}>
            {t("importList")}
          </Button>
        </Card>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Card className="p-4 sm:p-5">
              <GlassChip className="grid h-9 w-9 place-items-center rounded-xl bg-moss/10 text-moss">
                <Users size={18} />
              </GlassChip>
              <p className="mt-4 text-2xl font-semibold">
                {data.results.length}
              </p>
              <p className="mt-1 text-xs text-ink/65">{t("candidates")}</p>
            </Card>
            <Card className="p-4 sm:p-5">
              <GlassChip className="grid h-9 w-9 place-items-center rounded-xl bg-gold/20 text-ink">
                <Vote size={18} />
              </GlassChip>
              <p className="mt-4 text-2xl font-semibold">
                {number(totalSelections)}
              </p>
              <p className="mt-1 text-xs text-ink/65">{t("validSelections")}</p>
            </Card>
            <Card className="col-span-2 p-4 sm:col-span-1 sm:p-5">
              <GlassChip className="grid h-9 w-9 place-items-center rounded-xl bg-moss/10 text-moss">
                <Activity size={18} />
              </GlassChip>
              <p className="mt-4 flex items-center gap-2 text-lg font-semibold">
                {t("realtime")} <ArrowUpRight size={16} />
              </p>
              <p className="mt-1 text-xs text-ink/65">{t("totalsUpdating")}</p>
            </Card>
          </div>
          <Card
            glassVariant="liquid-refract"
            className="dashboard-chart-glass mt-5 overflow-hidden p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-ink">
                  {t("selectionsByCandidate")}
                </h2>
                <p className="mt-1 text-xs text-ink/65">
                  {t("descendingOrder")}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <GlassChip className="rounded-full bg-moss/10 px-3 py-1.5 text-xs font-semibold text-moss">
                  {t("candidateCount", { count: number(data.results.length) })}
                </GlassChip>
                <DashboardChartOrientationSwitch
                  orientation={chartOrientation}
                  onChange={setChartOrientation}
                />
              </div>
            </div>
            {data.results.length ? (
              <div className="mt-5 overflow-x-auto lg:overflow-x-hidden">
                <div
                  className="w-full min-w-[var(--candidate-chart-width)] lg:min-w-0"
                  style={
                    {
                      "--candidate-chart-width": `${chartOrientation === "vertical" ? Math.max(620, data.results.length * 112) : 620}px`,
                      height:
                        chartOrientation === "vertical"
                          ? 390
                          : Math.max(390, data.results.length * 42),
                    } as CSSProperties
                  }
                >
                  <DashboardResultsChart
                    results={data.results}
                    orientation={chartOrientation}
                  />
                </div>
              </div>
            ) : (
              <div className="grid h-64 place-items-center text-sm text-ink/65">
                {t("noValidBallots")}
              </div>
            )}
          </Card>
          <section className="mt-7">
            <h2 className="mb-3 font-semibold">{t("currentRanking")}</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.results.map((row, index) => (
                <Card
                  key={row.id}
                  glassVariant="subtle"
                  className="flex items-center gap-3 p-3"
                >
                  <span className="w-7 shrink-0 text-center text-sm font-bold text-ink/65">
                    {number(index + 1)}
                  </span>
                  <Image
                    src={row.image_url}
                    alt=""
                    fill
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <span className="min-w-0 flex-1 break-words text-sm font-semibold">
                    {candidateName(row, locale)}
                  </span>
                  <GlassChip className="shrink-0 rounded-lg px-3 py-2 text-sm font-bold">
                    {number(row.total)}
                  </GlassChip>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}
      <dialog
        ref={resetDialog}
        aria-labelledby="reset-election-title"
        aria-describedby="reset-election-description"
        className="native-modal m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border-0 bg-transparent p-0 text-ink"
        onCancel={(event) => {
          event.preventDefault();
          if (!resetBusy) setResetOpen(false);
        }}
        onClose={() => setResetOpen(false)}
      >
        <Card glassVariant="frosted" className="glass-overlay-panel p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <GlassChip className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--app-danger-bg)] text-[var(--app-danger)]">
              <AlertTriangle size={21} />
            </GlassChip>
            <div>
              <h2 id="reset-election-title" className="text-lg font-semibold">
                {t("confirmRerun")}
              </h2>
              <p
                id="reset-election-description"
                className="mt-2 text-sm leading-6 text-ink/65"
              >
                {t("rerunWarning")}
              </p>
            </div>
          </div>
          {resetError && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-[var(--app-danger-bg)] px-4 py-3 text-sm text-[var(--app-danger)]"
            >
              {resetError}
            </p>
          )}
          <div className="mt-6 flex flex-col justify-end gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              disabled={resetBusy}
              autoFocus
              onClick={() => setResetOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={resetBusy}
              onClick={confirmReset}
              aria-busy={resetBusy}
            >
              {resetBusy ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}{" "}
              {resetBusy ? t("deleting") : t("confirm")}
            </Button>
          </div>
        </Card>
      </dialog>
    </main>
  );
}
