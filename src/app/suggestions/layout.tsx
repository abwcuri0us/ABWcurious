import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suggestions",
  description:
    "Submit feature requests and suggestions to ABWcurious — help shape our product roadmap.",
  openGraph: {
    title: "Suggestions — ABWcurious",
    description: "Have an idea? Share it with us.",
    url: "https://abwcurious.com/suggestions",
  },
};

export default function SuggestionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}