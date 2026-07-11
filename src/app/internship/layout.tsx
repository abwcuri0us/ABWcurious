import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internship Program",
  description:
    "Apply for internships at ABWcurious in cybersecurity, AI, full-stack development, and more. Kick-start your tech career.",
  openGraph: {
    title: "Internships — ABWcurious",
    description: "Start your career with hands-on tech internships.",
    url: "https://abwcurious.com/internship",
  },
};

export default function InternshipLayout({ children }: { children: React.ReactNode }) {
  return children;
}