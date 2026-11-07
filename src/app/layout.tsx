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
      <script dangerouslySetInnerHTML={{ __html: `(()=>{try{const p=localStorage.getItem("appearance-theme");const t=p==="light"||p==="dark"?p:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch{document.documentElement.dataset.theme="light"}})()` }} />
    </head>
    <body><ThemeProvider>{children}</ThemeProvider></body>
  </html>;
}
