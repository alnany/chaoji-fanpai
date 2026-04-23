import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "超级翻牌 · 港风复古酒局",
  description: "一张牌，一口酒，一段江湖。港风复古翻牌饮酒游戏。",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#1a1614",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
