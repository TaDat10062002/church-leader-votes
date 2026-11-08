import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";

export const metadata: Metadata = {
  title: "Bầu chọn Ban Điều Hành",
  description: "Hệ thống bầu chọn Ban Điều Hành nhà thờ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: `(()=>{const r=document.documentElement;let p=null,c=null;try{p=localStorage.getItem("appearance-theme");c=localStorage.getItem("appearance-palette")}catch{}const t=p==="light"||p==="dark"?p:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");r.dataset.theme=t;r.style.colorScheme=t;r.dataset.palette=c==="navy"?"navy":"green";r.dataset.reducedTransparency=matchMedia("(prefers-reduced-transparency: reduce)").matches?"reduce":"no-preference";r.dataset.backdropSupported=String(typeof CSS!=="undefined"&&typeof CSS.supports==="function"&&(CSS.supports("backdrop-filter","blur(1px)")||CSS.supports("-webkit-backdrop-filter","blur(1px)")))})()` }} />
    </head>
    <body><ThemeProvider>{children}</ThemeProvider></body>
  </html>;
}
