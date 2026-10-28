import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const languages = { "bn-BD": `${base}/bn`, en: `${base}/en` };
  return (["bn", "en"] as const).map((locale) => ({
    url: `${base}/${locale}`,
    changeFrequency: "monthly" as const,
    priority: locale === "bn" ? 1 : 0.9,
    alternates: { languages },
  }));
}
