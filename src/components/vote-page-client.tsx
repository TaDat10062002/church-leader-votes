"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Church, LoaderCircle, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GlassHeader } from "@/components/ui/glass-header";
import { GlassChip } from "@/components/ui/glass-chip";
import BallotBuilder from "@/components/ballot-builder";
import ElectionClosedNotice from "@/components/election-closed-notice";
import { subscribeToElectionChanges } from "@/lib/election-realtime";
import { getElectionViewStatus } from "@/lib/election-view";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { ElectionData } from "@/lib/types";
import { useLocale } from "@/components/locale/locale-provider";
import { apiErrorMessage } from "@/lib/i18n";
import { getActiveElection, submitBallot } from "@/app/actions";

export default function VotePageClient({ initial }: { initial: Awaited<ReturnType<typeof getActiveElection>> }) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const localeRef = useRef(locale);
  const translateRef = useRef(t);
  localeRef.current = locale;
  translateRef.current = t;
  const [election, setElection] = useState<ElectionData | null>(initial.ok ? initial.data.election : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initial.ok ? "" : apiErrorMessage(locale, initial.code));
  const [sending, setSending] = useState(false);
  const snapshotRequest = useRef(0);
  const electionViewStatus = getElectionViewStatus(election);

  const loadElection = useCallback(
    async (showLoading: boolean | { nativeEvent: Event } = true) => {
      const requestId = ++snapshotRequest.current;
      if (typeof showLoading === "boolean" ? showLoading : true)
        setLoading(true);
      setError("");
      try {
        const response = await getActiveElection();
        if (!response.ok)
          throw new Error(apiErrorMessage(localeRef.current, response.code));
        if (requestId !== snapshotRequest.current) return;
        setElection(response.data.election);
      } catch (e) {
        if (requestId !== snapshotRequest.current) return;
        setError(
          e instanceof Error
            ? e.message
            : translateRef.current("cannotLoadCandidates"),
        );
      } finally {
        if (requestId === snapshotRequest.current) setLoading(false);
      }
    },
    [],
  );
  useEffect(() => {
    const client = getSupabaseBrowser();
    const unsubscribe = client ? subscribeToElectionChanges(client, () => {
      void loadElection(false);
    }) : undefined;
    // Also recover from missed realtime messages or changes made outside the app.
    const refresh = () => {
      if (document.visibilityState === "visible") void loadElection(false);
    };
    const timer = window.setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);
    return () => {
      unsubscribe?.();
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [loadElection]);

  async function submitVote(candidateIds: string[]) {
    if (!election) return false;
    setSending(true);
    setError("");
    try {
      const response = await submitBallot(election.id, candidateIds);
      if (!response.ok) throw new Error(apiErrorMessage(locale, response.code));
      router.replace("/thanks");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : t("cannotSubmitVote"));
      return false;
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-7xl px-3 pb-32 pt-3 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
      <GlassHeader className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
        <a
          href="/vote"
          aria-label={`${t("church")}, ${t("voteTitle")}`}
          className="flex min-w-0 shrink items-center gap-2"
        >
          <GlassChip className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-moss">
            <Church size={19} aria-hidden="true" />
          </GlassChip>
          <span className="hidden sm:block">
            <span className="block text-sm font-semibold text-ink">
              {t("church")}
            </span>
            <span className="block text-[11px] text-ink/75">
              {t("voteTitle")}
            </span>
          </span>
        </a>
      </GlassHeader>
      <section className="mx-auto mt-4 max-w-4xl text-center sm:mt-12">
        <GlassChip className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-ink sm:text-xs">
          <Vote size={14} aria-hidden="true" /> {t("ballotBadge")}
        </GlassChip>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:mt-4 sm:text-4xl lg:text-5xl">
          {t("voteHeading")}
        </h1>
        <p className="mx-auto mt-1.5 max-w-2xl text-xs leading-5 text-ink/75 sm:mt-3 sm:text-base sm:leading-6">
          {t("voteInstructions")}
        </p>
      </section>
      {loading ? (
        <Card
          glassVariant="subtle"
          role="status"
          className="mx-auto mt-8 grid min-h-48 max-w-xl place-items-center p-6 text-moss"
        >
          <LoaderCircle size={28} className="animate-spin" aria-hidden="true" />
          <span className="sr-only">{t("loadingCandidates")}</span>
        </Card>
      ) : error && !election ? (
        <Card className="mx-auto mt-8 max-w-xl p-6 text-center">
          <p role="alert">{error}</p>
          <Button className="mt-4" variant="secondary" onClick={loadElection}>
            {t("reload")}
          </Button>
        </Card>
      ) : electionViewStatus === "closed" ? (
        <ElectionClosedNotice />
      ) : electionViewStatus === "unavailable" ? (
        <Card className="mx-auto mt-8 max-w-xl p-8 text-center">
          <GlassChip className="mx-auto grid h-12 w-12 place-items-center rounded-full text-moss">
            <Vote aria-hidden="true" />
          </GlassChip>
          <h2 className="mt-4 text-xl font-semibold">
            {t("electionUnavailable")}
          </h2>
          <p className="mt-2 text-sm text-ink/75">{t("waitForElection")}</p>
        </Card>
      ) : election?.status === "opened" ? (
        <BallotBuilder
          candidates={election.candidates ?? []}
          error={error}
          setError={setError}
          sending={sending}
          onSubmit={submitVote}
        />
      ) : null}
    </main>
  );
}
