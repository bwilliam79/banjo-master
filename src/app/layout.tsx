import type { Metadata, Viewport } from "next";
import { Nunito, Fraunces, Caveat, Geist_Mono } from "next/font/google";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BanjoMaster - Learn Banjo",
  description:
    "Your personal banjo learning companion. Master chords, learn songs, and practice with built-in tools.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BanjoMaster",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#b4531f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fraunces.variable} ${caveat.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem('banjo-app-settings');var dark=null;if(raw){var s=JSON.parse(raw);if(typeof s==='object'&&s!==null&&typeof s.state==='object'&&s.state!==null&&typeof s.state.darkMode==='boolean'){dark=s.state.darkMode;}}if(dark===null){dark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;}if(dark)document.documentElement.classList.add('dark');}catch(e){try{if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.add('dark');}catch(e2){}}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
