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
      <script dangerouslySetInnerHTML={{ __html: `(()=>{const r=document.documentElement;try{const p=localStorage.getItem("appearance-theme");const t=p==="light"||p==="dark"?p:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");r.dataset.theme=t;r.style.colorScheme=t;const c=localStorage.getItem("appearance-palette");r.dataset.palette=c==="navy"?"navy":"green"}catch{r.dataset.theme="light";r.dataset.palette="green"}})()` }} />
    </head>
    <body><ThemeProvider>{children}</ThemeProvider></body>
  </html>;
}
