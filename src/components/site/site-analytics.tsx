"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type AnalyticsCommand = [string, ...unknown[]];

declare global {
  interface Window {
    _hmt?: AnalyticsCommand[];
  }
}

interface SiteAnalyticsProps {
  baiduAnalyticsId?: string;
}

export function SiteAnalytics({ baiduAnalyticsId }: SiteAnalyticsProps) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (baiduAnalyticsId) {
      window._hmt = window._hmt || [];
    }
  }, [baiduAnalyticsId]);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    if (baiduAnalyticsId) {
      window._hmt = window._hmt || [];
      window._hmt.push(["_trackPageview", pathname]);
    }
  }, [baiduAnalyticsId, pathname]);

  if (!baiduAnalyticsId) return null;

  return (
    <Script
      id="baidu-analytics"
      src={`https://hm.baidu.com/hm.js?${encodeURIComponent(baiduAnalyticsId)}`}
      strategy="afterInteractive"
    />
  );
}
