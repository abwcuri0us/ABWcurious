import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://abwcurious.com";

  // Use a static date so the sitemap is stable across builds.
  // Update this date when site content changes.
  const lastModified = new Date("2025-03-01");

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // ── Actual page routes ──
    {
      url: `${baseUrl}/careers`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/solutions`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/partnership`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/news`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/newsletter`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/research`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/internship`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/suggestions`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/status`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    // ── Legal pages ──
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}