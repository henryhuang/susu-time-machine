import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import { getChildProfile } from "@/lib/child-profile";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const child = await getChildProfile();
  const siteName = `${child.displayName}时光机`;
  return {
    metadataBase: getSiteUrl(),
    title: {
      default: siteName,
      template: `%s | ${siteName}`
    },
    description: `记录${child.displayName}成长故事的温柔时间轴。`,
    applicationName: siteName,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    referrer: "origin-when-cross-origin",
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true
      }
    },
    alternates: { canonical: "/" },
    openGraph: {
      title: siteName,
      description: "那些小小的表情、第一次和普通日常，都值得被好好保存。",
      url: "/",
      siteName,
      locale: "zh_CN",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: "那些小小的表情、第一次和普通日常，都值得被好好保存。"
    }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
