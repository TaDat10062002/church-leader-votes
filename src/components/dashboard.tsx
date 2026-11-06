"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowUpRight, Church, LogOut, RefreshCw, Users, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ResultRow } from "@/lib/types";
import { shouldRefreshResults } from "@/lib/results";

type Results = { election: { id: string } | null; results: ResultRow[] };

function AvatarTick(props: { x?: number; y?: number; payload?: { payload?: ResultRow } }) {
  const row = props.payload?.payload;
  if (!row) return null;
  const x = props.x ?? 0; const y = props.y ?? 0;
  const clipId = `clip-${row.id.replaceAll("-", "")}`;
  return <g transform={`translate(${x},${y})`}><defs><clipPath id={clipId}><circle cx="0" cy="19" r="16"/></clipPath></defs><image href={row.image_url} x="-16" y="3" width="32" height="32" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId})`}/><text x="0" y="45" textAnchor="middle" fill="#52645b" fontSize="11">{row.name.length > 13 ? `${row.name.slice(0, 12)}…` : row.name}</text></g>;
}

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<Results>({ election: null, results: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState<Date | null>(null);
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createClient(url, key) : null;
  }, []);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/results", { cache: "no-store" });
      const json = await response.json();
      if (response.status === 401) { router.replace("/vote"); return; }
      if (!response.ok) throw new Error(json.error);
      setData(json); setError(""); setUpdated(new Date());
    } catch (e) { setError(e instanceof Error ? e.message : "Không tải được kết quả."); }
    finally { setLoading(false); }
  }, [router]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!data.election || !supabase) return;
    const channel = supabase.channel(`election-${data.election.id}`).on("broadcast", { event: "vote-recorded" }, () => { if (shouldRefreshResults("vote-recorded")) void refresh(); }).subscribe((status) => { if (status === "SUBSCRIBED" && shouldRefreshResults("subscribed")) void refresh(); });
    const onFocus = () => { if (shouldRefreshResults("focus")) void refresh(); };
    window.addEventListener("focus", onFocus);
    return () => { window.removeEventListener("focus", onFocus); void supabase.removeChannel(channel); };
  }, [data.election?.id, refresh, supabase]);
  const totalSelections = data.results.reduce((sum, row) => sum + row.total, 0);

  async function logout() { await fetch("/api/admin/session", { method: "DELETE" }); router.replace("/vote"); }
  return <main className="mx-auto min-h-dvh max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
    <header className="flex flex-wrap items-center justify-between gap-3"><a href="/dashboard" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-moss/10 text-moss"><Church size={19}/></span><span><span className="block text-sm font-semibold text-ink">Bảng điều hành</span><span className="block text-[11px] text-ink/45">Kết quả bầu chọn trực tiếp</span></span></a><div className="flex gap-2"><Button variant="secondary" onClick={() => router.push("/import-file")}><Users size={16}/>Danh sách</Button><Button variant="ghost" onClick={logout} aria-label="Đăng xuất"><LogOut size={17}/><span className="hidden sm:inline">Thoát</span></Button></div></header>
    <section className="mt-8 flex flex-col justify-between gap-4 sm:mt-12 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-moss">Đang diễn ra</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Tổng hợp phiếu bầu</h1><p className="mt-2 text-sm text-ink/55">Biểu đồ tự cập nhật khi có phiếu hợp lệ mới.</p></div><div className="flex items-center gap-2 text-xs text-ink/50"><span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60"/><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-moss"/></span>{updated ? `Cập nhật ${updated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Đang kết nối"}<button onClick={refresh} className="rounded-full p-2 hover:bg-white" aria-label="Tải lại"><RefreshCw size={15}/></button></div></section>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {loading ? <Card className="mt-8 grid min-h-80 place-items-center text-moss"><RefreshCw className="animate-spin"/></Card> : !data.election ? <Card className="mt-8 p-8 text-center"><p className="font-semibold">Chưa có kỳ bầu chọn đang mở</p><Button className="mt-4" onClick={() => router.push("/import-file")}>Import danh sách</Button></Card> : <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3"><Card className="p-4 sm:p-5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-moss/10 text-moss"><Users size={18}/></span><p className="mt-4 text-2xl font-semibold">{data.results.length}</p><p className="mt-1 text-xs text-ink/50">Ứng viên</p></Card><Card className="p-4 sm:p-5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gold/20 text-ink"><Vote size={18}/></span><p className="mt-4 text-2xl font-semibold">{totalSelections}</p><p className="mt-1 text-xs text-ink/50">Lượt chọn hợp lệ</p></Card><Card className="col-span-2 p-4 sm:col-span-1 sm:p-5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700"><Activity size={18}/></span><p className="mt-4 flex items-center gap-2 text-lg font-semibold">Realtime <ArrowUpRight size={16}/></p><p className="mt-1 text-xs text-ink/50">Tổng phiếu đang được cập nhật</p></Card></div>
      <Card className="mt-5 overflow-hidden p-4 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-ink">Số lượt chọn theo ứng viên</h2><p className="mt-1 text-xs text-ink/50">Sắp xếp từ cao xuống thấp</p></div><span className="rounded-full bg-moss/10 px-3 py-1.5 text-xs font-semibold text-moss">{data.results.length} ứng viên</span></div>{data.results.length ? <div className="mt-5 overflow-x-auto"><div style={{ minWidth: Math.max(620, data.results.length * 112), height: 390 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={data.results} margin={{ top: 12, right: 14, left: 0, bottom: 12 }}><CartesianGrid stroke="#e8ece7" vertical={false}/><XAxis dataKey="name" interval={0} height={72} tick={<AvatarTick/>} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} width={32} axisLine={false} tickLine={false} tick={{ fill: "#87938a", fontSize: 12 }}/><Tooltip cursor={{ fill: "#edf2ec" }} contentStyle={{ border: "1px solid #e4e9e3", borderRadius: 14, boxShadow: "0 12px 30px #18332d14" }} formatter={(value) => [`${value} lượt`, "Lượt chọn"]}/><Bar dataKey="total" name="Lượt chọn" fill="#426b53" radius={[8, 8, 0, 0]} maxBarSize={58} label={{ position: "top", fill: "#18332d", fontSize: 12, fontWeight: 700 }}/></BarChart></ResponsiveContainer></div></div> : <div className="grid h-64 place-items-center text-sm text-ink/45">Chưa có phiếu hợp lệ nào.</div>}</Card>
      <section className="mt-7"><h2 className="mb-3 font-semibold">Thứ hạng hiện tại</h2><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{data.results.map((row, index) => <Card key={row.id} className="flex items-center gap-3 p-3"><span className="w-7 text-center text-sm font-bold text-ink/35">{index + 1}</span><img src={row.image_url} alt="" className="h-11 w-11 rounded-full object-cover"/><span className="min-w-0 flex-1 truncate text-sm font-semibold">{row.name}</span><span className="rounded-lg bg-cream px-3 py-2 text-sm font-bold">{row.total}</span></Card>)}</div></section>
    </>}
  </main>;
}
