import type { Metadata } from "next";
import { cookies } from "next/headers";
import "@fontsource-variable/inter";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LocaleProvider } from "@/components/locale/locale-provider";
import { localeCookieName, resolveLocale, translate } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  return {
    title: translate(locale, "metadataTitle"),
    description: translate(locale, "metadataDescription"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{const r=document.documentElement;r.dataset.reducedTransparency=matchMedia("(prefers-reduced-transparency: reduce)").matches?"reduce":"no-preference";r.dataset.backdropSupported=String(typeof CSS!=="undefined"&&typeof CSS.supports==="function"&&(CSS.supports("backdrop-filter","blur(1px)")||CSS.supports("-webkit-backdrop-filter","blur(1px)")))})()`,
          }}
        />
      </head>
      <body>
        <LocaleProvider initialLocale={locale}>
          <ThemeProvider>{children}</ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
