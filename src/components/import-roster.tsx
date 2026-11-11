"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  Check,
  FileDown,
  FileSpreadsheet,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GlassChip } from "@/components/ui/glass-chip";
import { GlassHeader } from "@/components/ui/glass-header";
import { glassClassName } from "@/lib/glass-variants";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { CandidateDraft } from "@/lib/types";
import { candidateName } from "@/lib/candidate-name";
import { canOptimizeCandidateImage } from "@/lib/candidate-image";
import { useLocale } from "@/components/locale/locale-provider";
import { apiErrorMessage } from "@/lib/i18n";
import {
  createProvisionalDrafts,
  removeProvisionalDraft,
  restoreProvisionalDraft,
  toCandidateDrafts,
  type DeletedDraft,
  type ProvisionalDraft,
} from "@/lib/roster-state";
import Image from "next/image";
import {
  parseRosterFile,
  startElection as startElectionAction,
} from "@/app/actions";

type RosterState = { waiting: ProvisionalDraft[]; deleted: DeletedDraft[] };

export default function ImportRoster() {
  const router = useRouter();
  const { locale, t, number } = useLocale();
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const waitingItemRefs = useRef(new Map<string, HTMLDivElement>());
  const [roster, setRoster] = useState<RosterState>({
    waiting: [],
    deleted: [],
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function importFile(file?: File) {
    if (!file) return;
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await parseRosterFile(form);
      if (!response.ok)
        throw new Error(
          apiErrorMessage(locale, response.code, response.values),
        );
      const data = response.data;
      setRoster({
        waiting: createProvisionalDrafts(data.candidates as CandidateDraft[]),
        deleted: [],
      });
      setMessage(t("importedCount", { count: number(data.candidates.length) }));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("cannotReadFile"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(id: string) {
    setRoster((current) =>
      removeProvisionalDraft(current.waiting, current.deleted, id),
    );
    setMessage("");
    setError("");
  }

  function restore(id: string) {
    setRoster((current) =>
      restoreProvisionalDraft(current.waiting, current.deleted, id),
    );
  }

  function followListLoading(id: string) {
    waitingItemRefs.current.get(id)?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "nearest",
    });
  }

  async function startElection() {
    setBusy(true);
    setError("");
    try {
      const response = await startElectionAction(
        toCandidateDrafts(roster.waiting),
      );
      if (!response.ok)
        throw new Error(
          apiErrorMessage(locale, response.code, response.values),
        );
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("cannotStartElection"));
    }
  }

  const { waiting, deleted } = roster;
  const listVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: prefersReducedMotion ? 0 : 0.08,
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  };
  const listItemVariants = {
    hidden: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion ? 0 : 8,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.25,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <GlassHeader className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <a
          href="/admin"
          aria-label={t("adminBack")}
          className="inline-flex size-10 shrink-0 items-center justify-center gap-2 rounded-full text-sm font-medium text-ink/60 hover:text-ink sm:size-auto sm:justify-start sm:rounded-none"
        >
          <ArrowLeft size={17} />
          <span className="hidden sm:inline">{t("adminTitle")}</span>
        </a>
        <GlassChip
          role="img"
          aria-label={t("importStep")}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-moss/10 text-xs font-bold text-moss sm:flex sm:size-auto sm:justify-center sm:px-3 sm:py-1.5 sm:text-center"
        >
          <Users size={16} aria-hidden="true" className="sm:hidden" />
          <span className="hidden sm:inline">{t("importStep")}</span>
        </GlassChip>
      </GlassHeader>
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-moss">
          {t("prepareElection")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t("importHeading")}
        </h1>
        <p className="mt-3 text-ink/60">{t("importDescription")}</p>
      </div>
      <Card className="mt-8 p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <GlassChip className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/15 text-ink">
              <FileSpreadsheet size={22} />
            </GlassChip>
            <div>
              <h2 className="font-semibold">{t("importExcel")}</h2>
              <p className="mt-1 text-sm text-ink/65">
                {t("importExcelDescription")}
              </p>
            </div>
          </div>
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => importFile(e.target.files?.[0])}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href="/api/admin/template"
              download
              className={glassClassName(
                "clear",
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-ink transition hover:border-moss/40 hover:bg-moss/5",
              )}
            >
              <FileDown size={17} />
              {t("downloadTemplate")}
            </a>
            <Button
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              <Upload size={17} />
              {busy ? t("processing") : t("chooseExcel")}
            </Button>
          </div>
        </div>
        <div
          className={glassClassName(
            "subtle",
            "mt-5 rounded-xl border-dashed border-moss/25 px-4 py-5 text-center text-sm text-ink/65 sm:py-7",
          )}
        >
          {t("embeddedImageNote")}
        </div>
      </Card>
      {(message || error) && (
        <div
          className={glassClassName(
            "frosted",
            `mt-5 rounded-xl px-4 py-3 text-sm ${error ? "text-[var(--app-danger)]" : "bg-moss/10 text-moss"}`,
          )}
          role={error ? "alert" : "status"}
        >
          {error || message}
        </div>
      )}
      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">
              {t("waitingList")}
            </h2>
            <p className="mt-1 text-sm text-ink/65">{t("savedWhenStarted")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="secondary"
                  aria-label={t("deletedCandidatesCount", {
                    count: number(deleted.length),
                  })}
                >
                  <RotateCcw size={16} />
                  {t("deletedCandidates")}{" "}
                  <GlassChip className="rounded-full bg-moss/10 px-2 py-0.5 text-xs text-moss">
                    {deleted.length}
                  </GlassChip>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                aria-describedby="deleted-candidates-description"
              >
                <SheetHeader>
                  <SheetTitle>{t("deletedTitle")}</SheetTitle>
                  <SheetDescription id="deleted-candidates-description">
                    {t("restoreDescription")}
                  </SheetDescription>
                </SheetHeader>
                {deleted.length === 0 ? (
                  <div
                    className={glassClassName(
                      "subtle",
                      "grid min-h-48 place-items-center rounded-xl border-dashed border-moss/25 px-5 text-center text-sm text-ink/65",
                    )}
                  >
                    {t("noDeletedCandidates")}
                  </div>
                ) : (
                  <motion.ul
                    className="flex flex-col gap-3"
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {deleted.map((draft) => (
                      <motion.li
                        key={draft.id}
                        variants={listItemVariants}
                        className={glassClassName(
                          "subtle",
                          "flex items-center gap-3 rounded-xl p-3",
                        )}
                      >
                        <Image
                          src={draft.candidate.image}
                          alt=""
                          width={48}
                          height={48}
                          unoptimized={
                            !canOptimizeCandidateImage(draft.candidate.image)
                          }
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                        <span className="min-w-0 flex-1 break-words text-sm font-medium text-ink">
                          {candidateName(draft.candidate, locale)}
                        </span>
                        <Button
                          variant="secondary"
                          className="shrink-0 px-3 modal-action-submit"
                          aria-label={t("restoreCandidate", {
                            name: candidateName(draft.candidate, locale),
                          })}
                          onClick={() => restore(draft.id)}
                        >
                          <RotateCcw size={15} />
                          {t("restore")}
                        </Button>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </SheetContent>
            </Sheet>
            <GlassChip className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink/65">
              <Users size={16} />
              {t("candidateCount", { count: number(waiting.length) })}
            </GlassChip>
          </div>
        </div>
        {waiting.length === 0 ? (
          <Card
            glassVariant="frosted"
            className="grid min-h-52 place-items-center border-dashed p-7 text-center shadow-none"
          >
            <div>
              <ImagePlus className="mx-auto text-moss/50" size={32} />
              <p className="mt-3 font-medium">{t("noCandidates")}</p>
              <p className="mt-1 text-sm text-ink/65">
                {t("chooseExcelToPreview")}
              </p>
            </div>
          </Card>
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {waiting.map((draft) => (
              <motion.div
                key={draft.id}
                ref={(node) => {
                  if (node) waitingItemRefs.current.set(draft.id, node);
                  else waitingItemRefs.current.delete(draft.id);
                }}
                variants={listItemVariants}
                onAnimationStart={() => followListLoading(draft.id)}
              >
                <Card
                  glassVariant="subtle"
                  className="group relative p-3 text-center transition-shadow duration-200 hover:shadow-soft sm:p-4"
                >
                  <Button
                    variant="ghost"
                    aria-label={t("removeCandidateNamed", {
                      name: candidateName(draft.candidate, locale),
                    })}
                    onClick={() => remove(draft.id)}
                    className="absolute right-2 top-2 grid size-11 min-h-0 place-items-center rounded-full p-0 text-ink/65 transition hover:text-[var(--app-danger)]"
                  >
                    <Trash2 size={16} />
                  </Button>
                  <Image
                    src={draft.candidate.image}
                    width={96}
                    height={96}
                    unoptimized={
                      !canOptimizeCandidateImage(draft.candidate.image)
                    }
                    alt=""
                    className="mx-auto h-20 w-20 rounded-full border-4 border-cream object-cover sm:h-24 sm:w-24"
                  />
                  <p className="mt-3 line-clamp-2 min-h-10 font-semibold text-ink">
                    {candidateName(draft.candidate, locale)}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-moss">
                    <Check size={13} />
                    {t("provisional")}
                  </span>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
      <Card
        glassVariant="liquid-refract"
        className="sticky bottom-3 z-10 mt-8 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
      >
        <p className="px-2 text-sm text-ink/60">
          {waiting.length
            ? t("willPublish", { count: number(waiting.length) })
            : t("importBeforeStart")}
          {deleted.length > 0
            ? ` ${t("deletedSummary", { count: number(deleted.length) })}`
            : ""}
        </p>
        <DialogPrimitive.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogPrimitive.Trigger asChild>
            <Button
              className="w-full sm:w-auto"
              disabled={busy || waiting.length === 0}
            >
              {busy ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <Check size={17} />
              )}
              {t("startVoting")}
            </Button>
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="modal-backdrop fixed inset-0 z-50" />
            <DialogPrimitive.Content
              asChild
              className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 text-ink shadow-xl outline-none"
            >
              <Card glassVariant="frosted" className="glass-overlay-panel">
                <DialogPrimitive.Title className="text-xl font-semibold">
                  {t("confirmStartElection")}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-3 text-sm leading-6 text-ink/65">
                  {t("startElectionDescription", {
                    count: number(waiting.length),
                  })}
                </DialogPrimitive.Description>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <DialogPrimitive.Close asChild>
                    <Button variant="secondary">{t("cancel")}</Button>
                  </DialogPrimitive.Close>
                  <DialogPrimitive.Close asChild>
                    <Button onClick={startElection}>{t("confirmStart")}</Button>
                  </DialogPrimitive.Close>
                </div>
              </Card>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </Card>
    </main>
  );
}
