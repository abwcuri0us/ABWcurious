import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status",
  description:
    "ABWcurious service status page — monitor uptime, incidents, and system health in real-time.",
  openGraph: {
    title: "System Status — ABWcurious",
    description: "Real-time service status and incident monitoring.",
    url: "https://abwcurious.com/status",
  },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}