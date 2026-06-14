import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getChildProfile } from "@/lib/child-profile";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const child = await getChildProfile();
  return (
    <>
      <SiteHeader displayName={child.displayName} />
      {children}
      <SiteFooter displayName={child.displayName} />
    </>
  );
}
