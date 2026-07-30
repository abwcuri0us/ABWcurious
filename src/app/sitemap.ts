import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://abwcurious.com";
  const lastModified = new Date("2026-07-28");

  // Service slugs
  const serviceSlugList = [
    "software-development", "website-development", "mobile-apps",
    "cloud-solutions", "digital-marketing", "devops", "it-consulting",
    "ui-ux-design", "maintenance-support", "automation",
    "ai-solutions", "machine-learning", "iot", "embedded-systems",
  ];

  // Product slugs
  const productSlugList = [
    "restaurant360", "intelliqr", "cyberintelligence360", "studyspark",
  ];

  // Blog slugs (in production, fetch from Supabase)
  const blogSlugList = [
    "zero-trust-security-model-2025",
    "llm-integration-enterprise-guide",
    "next-js-15-performance-optimization",
    "cloud-security-best-practices",
    "rag-systems-building-guide",
    "penetration-testing-methodology",
  ];

  return [
    // ── Core pages ──
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.9 },

    // ── Services ──
    { url: `${baseUrl}/services`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    ...serviceSlugList.map((slug) => ({
      url: `${baseUrl}/services/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    // ── IT Solutions & Cybersecurity ──
    { url: `${baseUrl}/it-solutions`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/cybersecurity`, lastModified, changeFrequency: "monthly", priority: 0.9 },

    // ── Products ──
    { url: `${baseUrl}/products`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    ...productSlugList.map((slug) => ({
      url: `${baseUrl}/products/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    // ── Blog ──
    { url: `${baseUrl}/blogs`, lastModified, changeFrequency: "daily", priority: 0.8 },
    ...blogSlugList.map((slug) => ({
      url: `${baseUrl}/blogs/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    // ── Other sections ──
    { url: `${baseUrl}/research`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/events`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/careers`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/internship`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/partnership`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/sponsorship`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/solutions`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/news`, lastModified, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/newsletter`, lastModified, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/status`, lastModified, changeFrequency: "daily", priority: 0.6 },
    { url: `${baseUrl}/feedback`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/suggestions`, lastModified, changeFrequency: "monthly", priority: 0.5 },

    // ── Auth ──
    { url: `${baseUrl}/login`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/signup`, lastModified, changeFrequency: "yearly", priority: 0.3 },

    // ── Legal ──
    { url: `${baseUrl}/privacy-policy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/cookie-policy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/refund-policy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/disclaimer`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}