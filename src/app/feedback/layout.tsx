import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Share your feedback with ABWcurious — help us improve our services and user experience.",
  openGraph: {
    title: "Feedback — ABWcurious",
    description: "We value your feedback. Let us know how we can improve.",
    url: "https://abwcurious.com/feedback",
  },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}