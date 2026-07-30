import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cybersecurity Services | VAPT, SOC, SIEM & Incident Response",
  description:
    "ABWcurious provides enterprise-grade cybersecurity services — VAPT, SOC as a Service, SIEM, incident response, cloud security, compliance, digital forensics, and security awareness training.",
  keywords: [
    "cybersecurity services India",
    "VAPT",
    "SOC as a service",
    "SIEM",
    "incident response",
    "penetration testing",
    "cloud security",
    "email security",
    "digital forensics",
    "compliance",
    "ISO 27001",
    "cyber security company Mumbai",
    "ABWcurious cybersecurity",
  ],
  alternates: {
    canonical: "https://abwcurious.com/cybersecurity",
  },
  openGraph: {
    title: "Cybersecurity Services | ABWcurious — Enterprise-Grade Cyber Defense & Intelligence",
    description:
      "Comprehensive cybersecurity services including VAPT, SOC, SIEM, incident response, cloud security, and compliance from ABWcurious experts.",
    url: "https://abwcurious.com/cybersecurity",
    type: "website",
    images: [{ url: "/logo.svg", width: 1200, height: 630, alt: "ABWcurious Cybersecurity" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cybersecurity Services | ABWcurious",
    description: "Enterprise cybersecurity — VAPT, SOC, SIEM, incident response, and compliance.",
    images: ["/logo.svg"],
  },
};

export default function CybersecurityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
