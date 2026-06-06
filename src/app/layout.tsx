import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "酥酥时光机",
    template: "%s | 酥酥时光机"
  },
  description: "记录酥酥成长故事的温柔时间轴。",
  applicationName: "酥酥时光机",
  authors: [{ name: "酥酥时光机" }],
  creator: "酥酥时光机",
  publisher: "酥酥时光机",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "酥酥时光机",
    description: "那些小小的表情、第一次和普通日常，都值得被好好保存。",
    url: "/",
    siteName: "酥酥时光机",
    locale: "zh_CN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "酥酥时光机",
    description: "那些小小的表情、第一次和普通日常，都值得被好好保存。"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
