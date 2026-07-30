import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | ABWcurious — Get in Touch",
  description:
    "Contact ABWcurious Pvt Ltd for business inquiries, technology services, cybersecurity consultations, careers, or partnership opportunities. We're here to help.",
  keywords: ["contact ABWcurious", "ABWcurious contact", "technology company contact", "cybersecurity inquiry", "business inquiry", "support", "ABWcurious Mumbai"],
  alternates: { canonical: "https://abwcurious.com/contact" },
  openGraph: {
    title: "Contact ABWcurious | Let's Build Something Together",
    description: "Reach out to ABWcurious for business inquiries, support, partnerships, or career opportunities. Our team is ready to help.",
    url: "https://abwcurious.com/contact",
    images: [{ url: "/logo.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact ABWcurious",
    description: "Get in touch with ABWcurious for technology services, cybersecurity, AI solutions, and more.",
    images: ["/logo.svg"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
