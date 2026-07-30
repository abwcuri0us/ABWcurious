import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${title} | ABWcurious Blog`,
    description: `Read our article on ${title.toLowerCase()} — expert technology insights from the ABWcurious team.`,
    alternates: { canonical: `https://abwcurious.com/blogs/${slug}` },
    openGraph: {
      title: `${title} | ABWcurious Blog`,
      description: `Expert technology article: ${title.toLowerCase()}`,
      url: `https://abwcurious.com/blogs/${slug}`,
      type: "article",
      images: [{ url: "/logo.svg", width: 1200, height: 630 }],
    },
  };
}

export default function BlogSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
