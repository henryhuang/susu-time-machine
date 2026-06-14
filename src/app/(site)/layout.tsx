import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteAnalytics } from "@/components/site/site-analytics";
import { getChildProfile } from "@/lib/child-profile";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const child = await getChildProfile();
  const baiduAnalyticsId = process.env.BAIDU_ANALYTICS_ID?.trim();

  return (
    <>
      <SiteAnalytics baiduAnalyticsId={baiduAnalyticsId} />
      <SiteHeader displayName={child.displayName} />
      {children}
      <SiteFooter displayName={child.displayName} />
    </>
  );
}
