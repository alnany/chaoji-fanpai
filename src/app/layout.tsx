import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWAInstall } from "@/components/PWAInstall";

export const metadata: Metadata = {
  title: "超级翻牌 · 港风复古酒局",
  description: "一张牌，一口酒，一段江湖。港风复古翻牌饮酒游戏。",
  manifest: "/manifest.webmanifest",
  applicationName: "超级翻牌",
  appleWebApp: {
    capable: true,
    title: "翻牌",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1614",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@400;600&family=Noto+Serif+SC:wght@600;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <PWAInstall />
      </body>
    </html>
  );
}
