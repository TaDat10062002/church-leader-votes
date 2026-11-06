import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bầu chọn Ban Điều Hành",
  description: "Hệ thống bầu chọn Ban Điều Hành nhà thờ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
