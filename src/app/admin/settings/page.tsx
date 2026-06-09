import { ProtectedAdmin } from "@/components/admin/protected-admin";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: { in: ["home_hero_image", "home_hero_title", "home_hero_description", "default_story_location"] }
    }
  });
  const map: Record<string, string> = {};
  for (const c of configs) {
    map[c.key] = c.value;
  }

  return (
    <ProtectedAdmin>
      <div className="grid gap-5">
        <div>
          <h1 className="text-2xl font-extrabold">站点设置</h1>
          <p className="mt-1 text-susu-muted">管理前台首页的展示内容和图片。</p>
        </div>
        <SettingsForm
          homeHeroImage={map.home_hero_image || ""}
          homeHeroTitle={map.home_hero_title || ""}
          homeHeroDescription={map.home_hero_description || ""}
          defaultStoryLocation={map.default_story_location || ""}
          fallbackImage="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80"
        />
      </div>
    </ProtectedAdmin>
  );
}
