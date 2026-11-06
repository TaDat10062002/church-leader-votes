import { Check, Church } from "lucide-react";

export default function ThanksPage() {
  return <main className="grid min-h-dvh place-items-center px-5 py-10">
    <section role="status" aria-live="polite" className="w-full max-w-sm rounded-3xl border border-ink/5 bg-white p-8 text-center shadow-soft sm:p-10">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-moss/10 text-moss"><Church size={21}/></span>
      <span className="mx-auto mt-7 grid h-16 w-16 place-items-center rounded-full bg-moss/10 text-moss"><Check size={30}/></span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-moss">Đã ghi nhận phiếu</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Thanks for your voting</h1>
      <p className="mt-3 text-sm leading-6 text-ink/55">Cảm ơn bạn đã tham gia bầu chọn Ban Điều Hành.</p>
    </section>
  </main>;
}
