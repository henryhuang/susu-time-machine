import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "酥酥时光机",
    template: "%s | 酥酥时光机"
  },
  description: "记录酥酥成长故事的温柔时间轴。",
  openGraph: {
    title: "酥酥时光机",
    description: "那些小小的表情、第一次和普通日常，都值得被好好保存。",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
