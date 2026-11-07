"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Church, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GlassInput } from "@/components/ui/glass-input";
import { ThemeControl } from "@/components/theme/theme-control";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ passcode: pin }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.push("/dashboard");
    } catch (e) { setError(e instanceof Error ? e.message : "Không thể đăng nhập."); }
    finally { setBusy(false); }
  }
  return <main className="relative grid min-h-dvh place-items-center px-4 py-10">
    <ThemeControl className="theme-control--floating" />
    <Card className="w-full max-w-md p-7 sm:p-9">
      <div className="glass-chip mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-moss/10 text-moss"><Church size={25}/></div>
      <p className="text-center text-xs font-bold uppercase tracking-[.22em] text-moss">Quản trị bầu chọn</p>
      <h1 className="mt-2 text-center text-2xl font-semibold text-ink">Nhập mã PIN quản trị</h1>
      <p className="mt-2 text-center text-sm text-ink/60">Dùng mã được ban tổ chức cung cấp để tiếp tục.</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <GlassInput icon={<KeyRound size={18}/>} radius={16} tint={0.012} autoComplete="one-time-code" inputMode="numeric" type="password" value={pin} onChange={(e) => setPin(e.target.value)} inputClassName="py-1 text-center tracking-[.4em]" placeholder="••••" aria-label="Mã PIN" required />
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Đang xác thực…" : "Vào trang quản trị"}<ArrowRight size={16}/></Button>
      </form>
      <a href="/vote" className="mt-5 block text-center text-sm text-ink/65 hover:text-ink">Quay lại trang bỏ phiếu</a>
    </Card>
  </main>;
}
