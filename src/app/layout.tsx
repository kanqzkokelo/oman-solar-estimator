import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Oman Rooftop Solar Estimator | الحاسبة الشمسية للمباني في عُمان",
  description:
    "Trace your rooftop on a satellite map and get an Oman-specific solar estimate: energy yield, bill savings, payback, CO₂ avoided and SDG 7 / SDG 11 / Net Zero 2050 impact.",
  keywords: ["Oman", "solar", "rooftop PV", "SDG 7", "Net Zero 2050", "payback", "Muscat", "عُمان", "طاقة شمسية"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');var l=localStorage.getItem('lang');if(l==='ar'){document.documentElement.dir='rtl';document.documentElement.lang='ar';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <LanguageProvider>
          <ThemeProvider>
            <MotionConfig reducedMotion="user">
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </MotionConfig>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
