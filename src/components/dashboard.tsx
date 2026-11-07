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
import { GlassHeader } from "@/components/ui/glass-header";
import {
  DashboardChartOrientationSwitch,
  DashboardResultsChart,
  type DashboardChartOrientation,
} from "@/components/dashboard-results-chart";
import type { ResultRow } from "@/lib/types";
import { shouldRefreshResults } from "@/lib/results";

type Results = { election: { id: string } | null; results: ResultRow[] };

export default function Dashboard() {
  const router = useRouter();
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
      if (!response.ok) throw new Error(json.error);
      setData(json);
      setError("");
      setUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được kết quả.");
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
        error?: string;
      } | null;
      if (response.status === 401) {
        router.replace("/vote");
        return;
      }
      if (!response.ok)
        throw new Error(
          result?.error ||
            "Không thể đặt lại dữ liệu bầu cử. Vui lòng thử lại.",
        );
      setData({ election: null, results: [] });
      setUpdated(null);
      setResetOpen(false);
      router.replace("/import-file");
    } catch (e) {
      setResetError(
        e instanceof Error
          ? e.message
          : "Không thể đặt lại dữ liệu bầu cử. Vui lòng thử lại.",
      );
    } finally {
      setResetBusy(false);
    }
  }
  return (
    <main className="mx-auto min-h-dvh max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <GlassHeader className="flex flex-wrap items-center justify-between gap-3">
        <a href="/dashboard" className="flex items-center gap-3">
          <span className="glass-chip grid h-10 w-10 place-items-center rounded-full bg-moss/10 text-moss">
            <Church size={19} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">
              Bảng điều hành
            </span>
            <span className="block text-[11px] text-ink/65">
              Kết quả bầu chọn trực tiếp
            </span>
          </span>
        </a>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="danger"
            onClick={() => {
              setResetError("");
              setResetOpen(true);
            }}
            aria-haspopup="dialog"
          >
            <Trash2 size={16} />
            Bầu cử lại
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/import-file")}
          >
            <Users size={16} />
            Danh sách
          </Button>
          <Button variant="ghost" onClick={logout} aria-label="Đăng xuất">
            <LogOut size={17} />
            <span className="hidden sm:inline">Thoát</span>
          </Button>
        </div>
      </GlassHeader>
      <section className="mt-8 flex flex-col justify-between gap-4 sm:mt-12 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-moss">
            Đang diễn ra
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Tổng hợp phiếu bầu
          </h1>
          <p className="mt-2 text-sm text-ink/65">
            Biểu đồ tự cập nhật khi có phiếu hợp lệ mới.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink/65">
          <span className="relative flex h-2.5 w-2.5">
            <span className="glass-chip absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60" />
            <span className="glass-chip relative inline-flex h-2.5 w-2.5 rounded-full bg-moss" />
          </span>
          {updated
            ? `Cập nhật ${updated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
            : "Đang kết nối"}
          <Button
            variant="ghost"
            onClick={refresh}
            className="size-11 rounded-full p-0"
            aria-label="Tải lại"
          >
            <RefreshCw size={15} />
          </Button>
        </div>
      </section>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {loading ? (
        <Card className="mt-8 grid min-h-80 place-items-center text-moss">
          <RefreshCw className="animate-spin" />
        </Card>
      ) : !data.election ? (
        <Card className="mt-8 p-8 text-center">
          <p className="font-semibold">Chưa có kỳ bầu chọn đang mở</p>
          <Button className="mt-4" onClick={() => router.push("/import-file")}>
            Import danh sách
          </Button>
        </Card>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Card className="p-4 sm:p-5">
              <span className="glass-chip grid h-9 w-9 place-items-center rounded-xl bg-moss/10 text-moss">
                <Users size={18} />
              </span>
              <p className="mt-4 text-2xl font-semibold">
                {data.results.length}
              </p>
              <p className="mt-1 text-xs text-ink/65">Ứng viên</p>
            </Card>
            <Card className="p-4 sm:p-5">
              <span className="glass-chip grid h-9 w-9 place-items-center rounded-xl bg-gold/20 text-ink">
                <Vote size={18} />
              </span>
              <p className="mt-4 text-2xl font-semibold">{totalSelections}</p>
              <p className="mt-1 text-xs text-ink/65">Lượt chọn hợp lệ</p>
            </Card>
            <Card className="col-span-2 p-4 sm:col-span-1 sm:p-5">
              <span className="glass-chip grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <Activity size={18} />
              </span>
              <p className="mt-4 flex items-center gap-2 text-lg font-semibold">
                Realtime <ArrowUpRight size={16} />
              </p>
              <p className="mt-1 text-xs text-ink/65">
                Tổng phiếu đang được cập nhật
              </p>
            </Card>
          </div>
          <Card className="mt-5 overflow-hidden p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-ink">
                  Số lượt chọn theo ứng viên
                </h2>
                <p className="mt-1 text-xs text-ink/65">
                  Sắp xếp từ cao xuống thấp
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="glass-chip rounded-full bg-moss/10 px-3 py-1.5 text-xs font-semibold text-moss">
                  {data.results.length} ứng viên
                </span>
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
                  style={{
                    "--candidate-chart-width": `${chartOrientation === "vertical" ? Math.max(620, data.results.length * 112) : 620}px`,
                    height:
                      chartOrientation === "vertical"
                        ? 390
                        : Math.max(390, data.results.length * 42),
                  } as CSSProperties}
                >
                  <DashboardResultsChart
                    results={data.results}
                    orientation={chartOrientation}
                  />
                </div>
              </div>
            ) : (
              <div className="grid h-64 place-items-center text-sm text-ink/65">
                Chưa có phiếu hợp lệ nào.
              </div>
            )}
          </Card>
          <section className="mt-7">
            <h2 className="mb-3 font-semibold">Thứ hạng hiện tại</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.results.map((row, index) => (
                <Card key={row.id} className="flex items-center gap-3 p-3">
                  <span className="w-7 text-center text-sm font-bold text-ink/35">
                    {index + 1}
                  </span>
                  <img
                    src={row.image_url}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {row.name}
                  </span>
                  <span className="glass-chip rounded-lg bg-cream px-3 py-2 text-sm font-bold">
                    {row.total}
                  </span>
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
        className="m-auto w-[calc(100%-2rem)] max-w-lg native-modal border-0 bg-transparent p-0 text-ink"
        onCancel={(event) => {
          event.preventDefault();
          if (!resetBusy) setResetOpen(false);
        }}
        onClose={() => setResetOpen(false)}
      >
        <Card className="glass-overlay-panel p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="glass-chip grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-700">
              <AlertTriangle size={21} />
            </span>
            <div>
              <h2 id="reset-election-title" className="text-lg font-semibold">
                Xác nhận bầu cử lại
              </h2>
              <p
                id="reset-election-description"
                className="mt-2 text-sm leading-6 text-ink/65"
              >
                Mọi dữ liệu bầu cử hiện tại sẽ bị xóa vĩnh viễn và không thể
                hoàn tác. Xác nhận khi bạn muốn thực hiện lại cuộc bầu cử.
              </p>
            </div>
          </div>
          {resetError && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
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
              Hủy
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
              {resetBusy ? "Đang xóa dữ liệu…" : "Xác nhận"}
            </Button>
          </div>
        </Card>
      </dialog>
    </main>
  );
}
