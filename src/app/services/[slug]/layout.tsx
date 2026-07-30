import type { Metadata } from "next";

const servicesMeta: Record<string, { title: string; description: string }> = {
  "software-development": {
    title: "Software Development Services | Custom Software Solutions",
    description: "ABWcurious delivers end-to-end software development services — web apps, enterprise systems, APIs, and microservices built for scale and reliability.",
  },
  "website-development": {
    title: "Website Development | Modern, High-Performance Websites",
    description: "Custom website development with Next.js, React, and modern frameworks. SEO-optimized, performance-first, mobile-responsive websites that convert.",
  },
  "mobile-apps": {
    title: "Mobile App Development | iOS & Android Apps",
    description: "Native and cross-platform mobile app development for iOS and Android. React Native, Flutter, and enterprise-grade mobile solutions.",
  },
  "cloud-solutions": {
    title: "Cloud Solutions | AWS, Azure & GCP Services",
    description: "Cloud architecture, migration, and managed cloud services. ABWcurious helps businesses leverage AWS, Azure, and GCP for scalable growth.",
  },
  "digital-marketing": {
    title: "Digital Marketing | SEO, SEM & Growth Services",
    description: "Data-driven digital marketing services including SEO, SEM, social media marketing, content strategy, and performance analytics.",
  },
  "devops": {
    title: "DevOps & CI/CD | Automation & Infrastructure Services",
    description: "DevOps transformation, CI/CD pipeline implementation, Docker, Kubernetes, and infrastructure as code for faster, reliable deployments.",
  },
  "it-consulting": {
    title: "IT Consulting | Strategic Technology Advisory",
    description: "Enterprise IT strategy, digital transformation roadmapping, technology audits, and architecture reviews from seasoned technology experts.",
  },
  "ui-ux-design": {
    title: "UI/UX Design | User-Centered Digital Experiences",
    description: "User research, wireframing, prototyping, and pixel-perfect UI design. We create design systems and digital experiences that users love.",
  },
  "maintenance-support": {
    title: "Maintenance & Support | 24/7 Technical Support Services",
    description: "Proactive maintenance, 24/7 monitoring, security patches, and ongoing technical support to keep your digital products running flawlessly.",
  },
  "automation": {
    title: "Process Automation | Workflow & RPA Solutions",
    description: "Business process automation, robotic process automation (RPA), API integrations, and intelligent workflow optimization services.",
  },
  "ai-solutions": {
    title: "AI Solutions | LLM, RAG & Intelligent Automation",
    description: "Custom AI solutions including LLM integration, RAG systems, AI chatbots, computer vision, and intelligent automation for enterprises.",
  },
  "machine-learning": {
    title: "Machine Learning | ML Models & MLOps Services",
    description: "Machine learning model development, training pipelines, MLOps, and production-grade ML deployments for real-world applications.",
  },
  "iot": {
    title: "IoT Solutions | Connected Device & Edge Computing Services",
    description: "IoT device management, edge computing, sensor integration, and connected system development for smart environments and Industry 4.0.",
  },
  "embedded-systems": {
    title: "Embedded Systems | Firmware & Hardware-Software Integration",
    description: "Embedded software, firmware development, RTOS integration, and hardware-software co-design for industrial and consumer applications.",
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = servicesMeta[slug] ?? {
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} | ABWcurious Services`,
    description: `Professional ${slug.replace(/-/g, " ")} services from ABWcurious — expert technology solutions tailored to your business needs.`,
  };

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `https://abwcurious.com/services/${slug}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://abwcurious.com/services/${slug}`,
      images: [{ url: "/logo.svg", width: 1200, height: 630 }],
    },
  };
}

export default function ServiceSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
