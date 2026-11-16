import type { Metadata, Viewport } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/client";
import { getT } from "@/lib/i18n/server";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Bengali glyphs; the latin text keeps the system UI font (see --font-sans in globals.css).
const bengali = Noto_Sans_Bengali({ subsets: ["bengali"], display: "swap", variable: "--font-bengali" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  openGraph: { type: "website", siteName: "Relief Management System", locale: "en_GB", alternateLocale: ["bn_BD"] },
  title: { default: "Relief Management System · ত্রাণ ব্যবস্থাপনা", template: "%s · Relief Management System" },
  description:
    "Register for relief support, check your application status and submit monthly requests. ত্রাণের জন্য আবেদন করুন, অবস্থা দেখুন ও মাসিক অনুরোধ জমা দিন।",
};

export const viewport: Viewport = { themeColor: "#0f766e", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  return (
    <html lang={t.lang} className={bengali.variable}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
        >
          {t("skip")}
        </a>
        <I18nProvider lang={t.lang}>{children}</I18nProvider>
      </body>
    </html>
  );
}
