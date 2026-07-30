import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Explore our successful projects and client success stories. See how ABWcurious delivers innovative technology solutions.",
  openGraph: {
    title: "Case Studies | ABWcurious Pvt Ltd",
    description: "Explore our successful projects and client success stories.",
  },
};

export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
