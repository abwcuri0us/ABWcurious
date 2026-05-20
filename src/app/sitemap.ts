import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://abwcurious.com";

  // Only include canonical URLs (no URL fragments/#)
  // Search engines ignore fragments; they should be handled via internal links
  // This is a single-page app so only the root URL is a valid sitemap entry
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
