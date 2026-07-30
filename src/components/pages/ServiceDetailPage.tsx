'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Brain,
  Camera,
  Shield,
  Globe,
  Smartphone,
  Headphones,
  TrendingUp,
  FileCheck,
  Users,
  ChevronDown,
  ChevronRight,
  Check,
  Zap,
  BarChart3,
  Eye,
  MessageSquare,
  Cpu,
  Database,
  Cloud,
  Lock,
  Code2,
  Layers,
  Rocket,
  Target,
  Award,
  Clock,
  Server,
  Wifi,
  Monitor,
  HardDrive,
  Palette,
  Search,
  Mail,
  Share2,
  MousePointerClick,
  LineChart,
  Wrench,
  RefreshCw,
  ShieldCheck,
  Settings,
  UserCheck,
  GraduationCap,
  Briefcase,
  BookOpen,
  Star,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  Fingerprint,
  Video,
  AlarmCheck,
  Scan,
  Bot,
  Workflow,
  GitBranch,
  Terminal,
  Layout,
  AppWindow,
  Smartphone as MobileIcon,
  TestTube,
  Gauge,
  Accessibility,
  Megaphone,
  PenTool,
  Hash,
  CalendarCheck,
  FileText,
  Handshake,
  UserPlus,
  ClipboardList,
  BadgeCheck,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigation } from '@/contexts/NavigationContext';

/* ================================================================== */
/*  ICON MAP                                                           */
/* ================================================================== */

const iconMap: Record<string, LucideIcon> = {
  Brain,
  Camera,
  Shield,
  Globe,
  Smartphone,
  Headphones,
  TrendingUp,
  FileCheck,
  Users,
  Zap,
  BarChart3,
  Eye,
  MessageSquare,
  Cpu,
  Database,
  Cloud,
  Lock,
  Code2,
  Layers,
  Rocket,
  Target,
  Award,
  Clock,
  Server,
  Wifi,
  Monitor,
  HardDrive,
  Palette,
  Search,
  Mail,
  Share2,
  MousePointerClick,
  LineChart,
  Wrench,
  RefreshCw,
  ShieldCheck,
  Settings,
  UserCheck,
  GraduationCap,
  Briefcase,
  BookOpen,
  Star,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  Fingerprint,
  Video,
  AlarmCheck,
  Scan,
  Bot,
  Workflow,
  GitBranch,
  Terminal,
  Layout,
  AppWindow,
  MobileIcon,
  TestTube,
  Gauge,
  Accessibility,
  Megaphone,
  PenTool,
  Hash,
  CalendarCheck,
  FileText,
  Handshake,
  UserPlus,
  ClipboardList,
  BadgeCheck,
  Lightbulb,
};

/* ================================================================== */
/*  TYPES                                                              */
/* ================================================================== */

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

interface Differentiator {
  stat: string;
  label: string;
  description: string;
}

interface PricingTier {
  name: string;
  price: string;
  features: string[];
  highlighted: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ServiceData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  accentRgb: string;
  features: Feature[];
  process: ProcessStep[];
  technologies: string[];
  differentiators: Differentiator[];
  pricing: PricingTier[];
  faq: FAQItem[];
}

/* ================================================================== */
/*  SERVICE DATA — ALL 9 SERVICES                                      */
/* ================================================================== */

const servicesData: Record<string, ServiceData> = {
  'ai-and-machine-learning': {
    name: 'AI and Machine Learning',
    slug: 'ai-and-machine-learning',
    tagline: 'Intelligence that transforms business',
    description:
      'Unlock the full potential of your data with ABWcurious\'s AI and Machine Learning solutions. We design, build, and deploy intelligent systems that automate decision-making, predict outcomes, and uncover hidden insights. From natural language processing and computer vision to predictive analytics and MLOps, our team delivers production-grade AI that drives measurable ROI for enterprises across India and beyond.',
    accentRgb: '124, 58, 237',
    features: [
      { icon: 'BarChart3', title: 'Predictive Analytics', description: 'Leverage historical data and advanced statistical models to forecast trends, demand, and customer behaviour with high accuracy.' },
      { icon: 'MessageSquare', title: 'Natural Language Processing', description: 'Build chatbots, sentiment analysers, document processors, and conversational AI that understands context and nuance.' },
      { icon: 'Eye', title: 'Computer Vision', description: 'Deploy image recognition, object detection, OCR, and video analytics solutions for quality control, security, and automation.' },
      { icon: 'Bot', title: 'Intelligent Automation', description: 'Combine AI with RPA to automate complex workflows — from invoice processing to customer onboarding — reducing manual effort by up to 80%.' },
      { icon: 'Workflow', title: 'MLOps & Model Management', description: 'End-to-end ML lifecycle management including model versioning, CI/CD pipelines, monitoring, and retraining automation.' },
      { icon: 'Database', title: 'Data Engineering & Pipelines', description: 'Design robust data pipelines, lakes, and warehouses that feed clean, structured data into your AI models at scale.' },
    ],
    process: [
      { step: 1, title: 'Discovery & Data Audit', description: 'We analyse your existing data landscape, identify opportunities for AI, and define measurable success criteria aligned with business goals.' },
      { step: 2, title: 'Model Design & Prototyping', description: 'Our data scientists design tailored ML architectures, train baseline models, and validate feasibility through rapid prototyping.' },
      { step: 3, title: 'Development & Training', description: 'We build production-ready models with rigorous testing, hyperparameter tuning, cross-validation, and bias detection.' },
      { step: 4, title: 'Deployment & Monitoring', description: 'Models are deployed via scalable APIs or edge inference, with continuous monitoring, drift detection, and automated retraining.' },
    ],
    technologies: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Hugging Face', 'Apache Spark', 'MLflow', 'Kubernetes', 'FastAPI', 'OpenCV', 'LangChain', 'AWS SageMaker'],
    differentiators: [
      { stat: '150+', label: 'AI Models Deployed', description: 'Production-grade models serving enterprises across healthcare, finance, retail, and manufacturing.' },
      { stat: '92%', label: 'Client Retention', description: 'Our clients stay because our AI solutions consistently deliver measurable business impact.' },
      { stat: '3x', label: 'Faster Time-to-Value', description: 'Our MLOps framework reduces deployment cycles from months to weeks.' },
      { stat: '40%', label: 'Cost Reduction', description: 'Intelligent automation cuts operational costs while improving accuracy and throughput.' },
    ],
    pricing: [
      { name: 'Basic', price: '₹75,000', features: ['Data audit & feasibility study', '1 ML model development', 'Basic API deployment', '30-day post-deployment support', 'Documentation & knowledge transfer'], highlighted: false },
      { name: 'Professional', price: '₹2,50,000', features: ['End-to-end data pipeline design', '3 ML model development', 'MLOps pipeline setup', 'Model monitoring dashboard', '90-day support & optimisation', 'A/B testing framework'], highlighted: true },
      { name: 'Enterprise', price: 'Custom', features: ['Full AI transformation roadmap', 'Unlimited model development', 'Dedicated ML engineering team', 'On-premise & cloud deployment', '24/7 monitoring & retraining', 'Quarterly business review'], highlighted: false },
    ],
    faq: [
      { question: 'What types of AI solutions does ABWcurious specialise in?', answer: 'We specialise in predictive analytics, NLP, computer vision, recommendation systems, anomaly detection, and intelligent automation. Our solutions are tailored for industries including healthcare, finance, manufacturing, and retail.' },
      { question: 'How long does it take to deploy an AI model?', answer: 'Depending on complexity, a baseline model can be prototyped in 2-4 weeks. Production deployment with MLOps typically takes 6-12 weeks. Our agile methodology ensures you see incremental value throughout the process.' },
      { question: 'Do you provide ongoing model maintenance?', answer: 'Yes. Our Professional and Enterprise plans include model monitoring, drift detection, and automated retraining. We ensure your models remain accurate and relevant as your data evolves.' },
      { question: 'Can ABWcurious work with our existing data infrastructure?', answer: 'Absolutely. We integrate with all major data platforms — AWS, Azure, GCP, Snowflake, Databricks, and on-premise data lakes. Our data engineers handle the heavy lifting so your AI models get clean, reliable data.' },
      { question: 'Is my data secure during AI development?', answer: 'Data security is paramount. We follow ISO 27001 and NIST frameworks, encrypt data at rest and in transit, and can work within your VPC. We sign NDAs and comply with Indian data protection regulations.' },
    ],
  },

  'electronic-security-system': {
    name: 'Electronic Security System',
    slug: 'electronic-security-system',
    tagline: 'Protecting what matters most',
    description:
      'ABWcurious delivers comprehensive electronic security solutions that safeguard your premises, assets, and people. From high-definition CCTV surveillance and biometric access control to intrusion detection and integrated security management platforms, we design, deploy, and maintain systems that provide round-the-clock protection. Our solutions are trusted by businesses, government facilities, and residential complexes across Navi Mumbai and beyond.',
    accentRgb: '220, 38, 38',
    features: [
      { icon: 'Video', title: 'CCTV Surveillance', description: 'High-definition IP cameras with AI-powered analytics, motion detection, night vision, and remote monitoring via mobile and web dashboards.' },
      { icon: 'Fingerprint', title: 'Biometric Access Control', description: 'Fingerprint, facial recognition, and iris-based access systems that eliminate key/card vulnerabilities and maintain audit trails.' },
      { icon: 'AlarmCheck', title: 'Intrusion Detection', description: 'Perimeter and interior intrusion detection with real-time alerts, automated lockdown, and integration with law enforcement systems.' },
      { icon: 'Monitor', title: 'Centralised Security Management', description: 'Unified command centre platforms that consolidate all security subsystems into a single pane of glass for operators.' },
      { icon: 'Scan', title: 'ANPR & Vehicle Tracking', description: 'Automatic Number Plate Recognition for parking management, visitor tracking, and black-list vehicle alerts at entry/exit points.' },
      { icon: 'Cloud', title: 'Cloud-Based Monitoring', description: 'Store and access footage securely in the cloud with encrypted transmission, redundant backups, and compliance-ready retention policies.' },
    ],
    process: [
      { step: 1, title: 'Site Survey & Risk Assessment', description: 'Our security experts conduct an on-site assessment to identify vulnerabilities, entry points, blind spots, and specific threat vectors.' },
      { step: 2, title: 'System Design & Engineering', description: 'We design a tailored security architecture with optimal camera placement, access zones, and integration points for seamless operation.' },
      { step: 3, title: 'Installation & Commissioning', description: 'Professional installation by certified technicians with structured cabling, network configuration, and system commissioning.' },
      { step: 4, title: 'Training & Managed Services', description: 'Operator training, SOP development, and optional 24/7 managed monitoring services to ensure continuous protection.' },
    ],
    technologies: ['Hikvision', 'Dahua', 'Axis Communications', 'ZKTeco', 'Vivotek', 'Milestone XProtect', 'Genetec', 'Bosch Security', 'Honeywell', 'DSC', 'RFID', 'ANPR AI'],
    differentiators: [
      { stat: '500+', label: 'Installations', description: 'Successfully deployed security systems across commercial, industrial, and residential sites in Maharashtra.' },
      { stat: '99.7%', label: 'Uptime Guarantee', description: 'Our proactive maintenance and redundant architecture ensure near-zero downtime for your security infrastructure.' },
      { stat: '24/7', label: 'Monitoring Support', description: 'Round-the-clock NOC support with real-time alert management and incident response coordination.' },
      { stat: '50%', label: 'Faster Incident Response', description: 'AI-powered analytics reduce false alarms and accelerate genuine threat detection significantly.' },
    ],
    pricing: [
      { name: 'Basic', price: '₹1,50,000', features: ['Up to 8 IP cameras', 'Basic NVR with 30-day storage', 'Mobile app remote viewing', 'Motion detection alerts', '1-year warranty'], highlighted: false },
      { name: 'Professional', price: '₹4,50,000', features: ['Up to 24 IP cameras', 'Biometric access control (2 doors)', 'AI analytics dashboard', '90-day cloud backup', 'Intrusion detection system', '3-year warranty & AMC'], highlighted: true },
      { name: 'Enterprise', price: 'Custom', features: ['Unlimited camera deployment', 'Full biometric & ANPR integration', 'Centralised command centre', '1-year cloud retention', '24/7 managed monitoring', 'Annual security audit & upgrades'], highlighted: false },
    ],
    faq: [
      { question: 'What brands of security equipment do you use?', answer: 'We work with globally trusted brands including Hikvision, Dahua, Axis, ZKTeco, Bosch, and Honeywell. We select equipment based on your specific requirements, environment, and budget.' },
      { question: 'Can I monitor my premises remotely?', answer: 'Yes. All our systems come with mobile apps and web dashboards that allow you to view live feeds, receive alerts, and manage access from anywhere in the world.' },
      { question: 'Do you provide AMC for existing installations?', answer: 'Absolutely. We offer Annual Maintenance Contracts for systems we install as well as those installed by other vendors. Our AMC includes preventive maintenance, firmware updates, and priority support.' },
      { question: 'How long is footage stored?', answer: 'Storage duration depends on your plan and compliance requirements. Basic setups offer 30-day local storage, while enterprise solutions provide up to 1 year of cloud-backed retention with encrypted access.' },
      { question: 'Is the system scalable?', answer: 'Yes. Our solutions are designed to scale from a single-site setup to multi-location deployments. You can add cameras, access points, and sensors as your needs grow without replacing existing infrastructure.' },
    ],
  },

  'cyber-security': {
    name: 'Cyber Security',
    slug: 'cyber-security',
    tagline: 'Defending your digital frontier',
    description:
      'In an era of escalating cyber threats, ABWcurious provides end-to-end cybersecurity solutions that protect your organisation\'s digital assets, data, and reputation. Our services span VAPT, Security Operations Centre (SOC), compliance management, threat intelligence, incident response, and security awareness training. We follow OWASP, NIST, and ISO 27001 frameworks to deliver enterprise-grade protection for businesses of all sizes.',
    accentRgb: '8, 145, 178',
    features: [
      { icon: 'Shield', title: 'VAPT Services', description: 'Comprehensive Vulnerability Assessment and Penetration Testing following OWASP and NIST methodologies to identify and eliminate security weaknesses before attackers exploit them.' },
      { icon: 'Server', title: 'Security Operations Centre', description: '24/7 SOC-as-a-Service with SIEM integration, real-time threat monitoring, incident triage, and automated response orchestration.' },
      { icon: 'Lock', title: 'Compliance & Governance', description: 'Achieve and maintain compliance with ISO 27001, SOC 2, GDPR, PCI-DSS, and Indian DPDP Act through our structured compliance programmes.' },
      { icon: 'Search', title: 'Threat Intelligence', description: 'Proactive threat hunting leveraging OSINT, dark web monitoring, and industry-specific threat feeds to stay ahead of emerging attack vectors.' },
      { icon: 'Zap', title: 'Incident Response', description: 'Rapid incident response with forensic analysis, containment, eradication, and recovery. Our IR team is available 24/7 for critical security breaches.' },
      { icon: 'GraduationCap', title: 'Security Awareness Training', description: 'Phishing simulations, interactive workshops, and compliance training that transform employees from security liabilities into your first line of defence.' },
    ],
    process: [
      { step: 1, title: 'Assessment & Gap Analysis', description: 'We perform a comprehensive security assessment including vulnerability scans, policy reviews, and gap analysis against relevant compliance frameworks.' },
      { step: 2, title: 'Strategy & Roadmap', description: 'Based on findings, we develop a prioritised cybersecurity roadmap with quick wins and long-term strategic initiatives aligned to your risk appetite.' },
      { step: 3, title: 'Implementation & Hardening', description: 'Our engineers deploy security controls, configure SIEM/SOC, harden infrastructure, and implement zero-trust architecture across your environment.' },
      { step: 4, title: 'Monitoring & Continuous Improvement', description: 'Ongoing threat monitoring, periodic pen testing, compliance audits, and security awareness programmes to maintain a resilient security posture.' },
    ],
    technologies: ['Splunk', 'Wazuh', 'Burp Suite', 'Nessus', 'Metasploit', 'OWASP ZAP', 'CrowdStrike', 'Claroty', 'Snort', 'Wireshark', 'VirusTotal', 'MITRE ATT&CK'],
    differentiators: [
      { stat: '200+', label: 'VAPT Engagements', description: 'Completed penetration tests across BFSI, healthcare, IT/ITES, and government sectors with zero false-negative commitments.' },
      { stat: '15 min', label: 'Avg. Response Time', description: 'Our SOC team detects and begins triaging critical incidents within 15 minutes of alert generation.' },
      { stat: '100%', label: 'Compliance Success', description: 'Every client we\'ve assisted with ISO 27001, SOC 2, or PCI-DSS has achieved certification on first audit.' },
      { stat: '₹0', label: 'Data Breach Losses', description: 'Zero successful data breaches reported by clients under our managed SOC programme since inception.' },
    ],
    pricing: [
      { name: 'Basic', price: '₹50,000', features: ['Vulnerability assessment (1 scope)', 'Penetration test report', 'Remediation guidance', '30-day re-test', 'Executive summary presentation'], highlighted: false },
      { name: 'Professional', price: '₹2,00,000', features: ['Full VAPT (3 scopes)', 'SOC-as-a-Service (8×5)', 'SIEM deployment & tuning', 'Quarterly compliance review', 'Incident response retainer', 'Security awareness training (50 users)'], highlighted: true },
      { name: 'Enterprise', price: 'Custom', features: ['Unlimited VAPT scopes', '24/7 Managed SOC', 'Full compliance programme', 'Dedicated CISO-as-a-Service', 'Threat intelligence feeds', 'Red team / blue team exercises'], highlighted: false },
    ],
    faq: [
      { question: 'What is VAPT and why do I need it?', answer: 'VAPT (Vulnerability Assessment and Penetration Testing) identifies security weaknesses in your applications, networks, and infrastructure. It\'s essential for proactive risk management and is often a compliance requirement for ISO 27001, PCI-DSS, and SOC 2.' },
      { question: 'How does your SOC-as-a-Service work?', answer: 'Our SOC monitors your environment 24/7 using SIEM platforms like Splunk or Wazuh. We detect, analyse, and respond to threats in real-time, escalating critical incidents immediately and providing monthly threat reports.' },
      { question: 'Can you help us achieve ISO 27001 certification?', answer: 'Yes. We provide end-to-end ISO 27001 consulting — from gap analysis and risk assessment to policy development, controls implementation, and audit preparation. Our clients have a 100% first-audit certification rate.' },
      { question: 'What happens during a security incident?', answer: 'Our incident response team follows a structured process: detection, containment, eradication, recovery, and post-incident analysis. We provide forensic reports and work with your legal and management teams as needed.' },
      { question: 'Do you offer cybersecurity training for employees?', answer: 'Yes. We conduct phishing simulations, interactive workshops, and role-based security training. Programmes can be customised for developers, executives, and general staff, with completion tracking and certification.' },
    ],
  },

  'website-development': {
    name: 'Website Development',
    slug: 'website-development',
    tagline: 'Crafting digital experiences that convert',
    description:
      'ABWcurious builds high-performance, visually stunning websites and web applications that drive engagement and conversions. Leveraging modern frameworks like Next.js, React, and TypeScript, we deliver responsive, SEO-optimised, and accessible web solutions tailored to your brand. From corporate sites and e-commerce platforms to SaaS dashboards and progressive web apps, our full-stack team handles it all.',
    accentRgb: '8, 145, 178',
    features: [
      { icon: 'Code2', title: 'Modern Frameworks', description: 'Built with Next.js, React, and TypeScript for blazing-fast performance, server-side rendering, and exceptional developer experience.' },
      { icon: 'Search', title: 'SEO Optimisation', description: 'Technical SEO best practices baked into every build — structured data, Core Web Vitals optimisation, semantic HTML, and crawl-friendly architecture.' },
      { icon: 'Palette', title: 'Custom UI/UX Design', description: 'Pixel-perfect, brand-consistent designs with intuitive navigation, responsive layouts, and WCAG 2.1 accessibility compliance.' },
      { icon: 'Gauge', title: 'Performance Engineering', description: 'Sub-second load times through image optimisation, code splitting, CDN deployment, and advanced caching strategies.' },
      { icon: 'ShieldCheck', title: 'Enterprise Security', description: 'HTTPS, CSP headers, input sanitisation, CSRF protection, and regular security audits to protect your site and users.' },
      { icon: 'Layout', title: 'CMS & Content Management', description: 'Headless CMS integration (Strapi, Sanity, Contentful) enabling your team to manage content independently without developer dependency.' },
    ],
    process: [
      { step: 1, title: 'Strategy & Wireframing', description: 'We define information architecture, user journeys, and create wireframes that align with your business objectives and audience needs.' },
      { step: 2, title: 'Design & Prototyping', description: 'High-fidelity UI designs in Figma with interactive prototypes, design systems, and client review cycles for rapid iteration.' },
      { step: 3, title: 'Development & QA', description: 'Agile sprints with continuous integration, automated testing, cross-browser compatibility checks, and performance benchmarking.' },
      { step: 4, title: 'Launch & Optimisation', description: 'Zero-downtime deployment, analytics setup, SEO verification, and ongoing A/B testing to maximise conversions.' },
    ],
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Supabase', 'Vercel', 'Figma', 'Storybook', 'Jest', 'Playwright'],
    differentiators: [
      { stat: '98+', label: 'PageSpeed Score', description: 'Our websites consistently score 98+ on Google PageSpeed Insights for both mobile and desktop, ensuring top search rankings.' },
      { stat: '300%', label: 'Avg. Conversion Lift', description: 'Data-driven design and CRO techniques deliver an average 300% improvement in conversion rates for our clients.' },
      { stat: '99.99%', label: 'Uptime SLA', description: 'Enterprise-grade hosting with auto-scaling, CDN, and redundant infrastructure guarantees near-perfect availability.' },
      { stat: '<1s', label: 'Load Time', description: 'Optimised builds with SSR, edge caching, and asset pipelines deliver sub-second time-to-interactive worldwide.' },
    ],
    pricing: [
      { name: 'Basic', price: '₹45,000', features: ['Up to 5 pages', 'Responsive design', 'Basic SEO setup', 'Contact form integration', '1 revision round', '3-month support'], highlighted: false },
      { name: 'Professional', price: '₹1,50,000', features: ['Up to 15 pages', 'Custom UI/UX design', 'Advanced SEO & analytics', 'CMS integration', 'E-commerce ready', '6-month support & optimisation'], highlighted: true },
      { name: 'Enterprise', price: 'Custom', features: ['Unlimited pages & features', 'Custom web application', 'Full-stack development', 'CI/CD pipeline setup', 'Dedicated project manager', '12-month priority support'], highlighted: false },
    ],
    faq: [
      { question: 'What technology stack do you use for websites?', answer: 'We primarily use Next.js with React and TypeScript, styled with Tailwind CSS. The backend runs on Node.js with PostgreSQL via Supabase. We deploy on Vercel or AWS depending on requirements.' },
      { question: 'How long does it take to build a website?', answer: 'A basic 5-page site takes 2-3 weeks. A professional site with CMS takes 4-6 weeks. Enterprise web applications typically take 8-16 weeks depending on complexity and integrations.' },
      { question: 'Will my website be mobile-friendly?', answer: 'Absolutely. Every website we build follows a mobile-first responsive design approach, ensuring perfect display and interaction on all devices from smartphones to large desktops.' },
      { question: 'Do you provide website maintenance after launch?', answer: 'Yes. All our plans include post-launch support. We also offer standalone AMC plans for ongoing maintenance, updates, security patches, and performance optimisation.' },
      { question: 'Can I update the website content myself?', answer: 'Yes. For Professional and Enterprise plans, we integrate a headless CMS that allows your team to update text, images, and articles without any coding knowledge.' },
    ],
  },

  'application-development': {
    name: 'Application Development',
    slug: 'application-development',
    tagline: 'Apps that users love and businesses rely on',
    description:
      'ABWcurious creates powerful, intuitive mobile and desktop applications that delight users and drive business outcomes. Whether you need a native iOS/Android app, a cross-platform solution with React Native or Flutter, or a complex enterprise application, our team delivers pixel-perfect UIs, robust backends, and seamless third-party integrations. We handle the entire lifecycle from ideation and design to development, testing, and app store deployment.',
    accentRgb: '0, 102, 255',
    features: [
      { icon: 'Smartphone', title: 'Cross-Platform Development', description: 'Build once, deploy everywhere with React Native and Flutter — reducing development time and cost while maintaining native-like performance.' },
      { icon: 'Layers', title: 'Native iOS & Android', description: 'When performance demands it, we build fully native apps using Swift and Kotlin for the best possible user experience on each platform.' },
      { icon: 'Cloud', title: 'Scalable Backend Systems', description: 'Robust cloud-native backends with microservices architecture, auto-scaling, and real-time data synchronisation for millions of users.' },
      { icon: 'Zap', title: 'Third-Party Integrations', description: 'Seamless integration with payment gateways, CRMs, ERPs, social platforms, mapping services, and IoT devices.' },
      { icon: 'TestTube', title: 'Automated Testing & QA', description: 'Comprehensive testing strategy with unit, integration, and E2E tests ensuring reliability across devices, OS versions, and network conditions.' },
      { icon: 'Rocket', title: 'App Store Deployment', description: 'Full app store preparation including ASO, compliance review, privacy policies, and submission management for Apple App Store and Google Play.' },
    ],
    process: [
      { step: 1, title: 'Ideation & Requirements', description: 'We workshop your app concept, define user personas, map features to business goals, and create a detailed product requirements document.' },
      { step: 2, title: 'UI/UX Design', description: 'User-centric design with wireframes, interactive prototypes, and design systems. We validate flows with usability testing before writing a single line of code.' },
      { step: 3, title: 'Agile Development', description: 'Sprint-based development with weekly demos, continuous integration, and automated testing. You see real progress every week.' },
      { step: 4, title: 'Launch & Growth', description: 'App store submission, analytics integration, crash monitoring, and post-launch iteration based on real user feedback and usage data.' },
    ],
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Node.js', 'Firebase', 'AWS Amplify', 'GraphQL', 'Redux', 'Expo', 'Fastlane', 'Sentry'],
    differentiators: [
      { stat: '50+', label: 'Apps Delivered', description: 'From fintech to healthcare, we\'ve delivered apps across diverse domains on both iOS and Android platforms.' },
      { stat: '4.8★', label: 'Avg. App Store Rating', description: 'Our apps consistently earn high ratings for performance, design, and user experience.' },
      { stat: '60%', label: 'Faster Time-to-Market', description: 'Cross-platform development and reusable component libraries cut launch timelines significantly.' },
      { stat: '99.9%', label: 'Crash-Free Rate', description: 'Rigorous testing and real-time monitoring ensure near-zero crashes in production environments.' },
    ],
    pricing: [
      { name: 'Basic', price: '₹2,00,000', features: ['Single platform (iOS or Android)', 'Up to 8 screens', 'Basic backend API', 'Push notifications', 'App store submission', '3-month support'], highlighted: false },
      { name: 'Professional', price: '₹5,00,000', features: ['Cross-platform (iOS + Android)', 'Up to 20 screens', 'Full backend with admin panel', 'Payment integration', 'Analytics & crash monitoring', '6-month support & iteration'], highlighted: true },
      { name: 'Enterprise', price: 'Custom', features: ['Full product development', 'Complex integrations & IoT', 'Microservices architecture', 'Dedicated dev team', 'Continuous deployment pipeline', '12-month SLA & evolution'], highlighted: false },
    ],
    faq: [
      { question: 'Should I build a native or cross-platform app?', answer: 'It depends on your requirements. Cross-platform (React Native/Flutter) is ideal for most business apps, offering 90%+ code sharing with near-native performance. Native development is recommended for apps requiring heavy graphics, AR/VR, or platform-specific APIs.' },
      { question: 'How do you handle app security?', answer: 'We implement OWASP Mobile Top 10 safeguards including certificate pinning, encrypted local storage, secure API communication, biometric authentication, and runtime protection against tampering.' },
      { question: 'Can you update an existing app?', answer: 'Yes. We audit existing codebases, identify technical debt, and provide modernisation roadmaps. We\'ve successfully migrated legacy apps to modern frameworks while adding new features.' },
      { question: 'What happens after the app is launched?', answer: 'Post-launch, we provide monitoring, bug fixes, OS compatibility updates, and feature enhancements. Our Professional and Enterprise plans include ongoing support and iterative development cycles.' },
      { question: 'Do you sign NDAs for app projects?', answer: 'Absolutely. We sign comprehensive NDAs before any project begins. Your intellectual property, source code, and business logic remain fully protected throughout and after development.' },
    ],
  },

  'it-supports': {
    name: 'IT Supports',
    slug: 'it-supports',
    tagline: 'Keeping your business running seamlessly',
    description:
      'ABWcurious provides comprehensive IT support services that ensure your technology infrastructure operates at peak performance. From 24/7 helpdesk and network monitoring to cloud migration and disaster recovery, our certified engineers deliver proactive, enterprise-grade IT management. We serve as your trusted IT partner, letting you focus on your core business while we handle the technology.',
    accentRgb: '52, 211, 153',
    features: [
      { icon: 'Headphones', title: '24/7 Helpdesk', description: 'Round-the-clock L1/L2/L3 support via phone, email, and chat with guaranteed response times and escalation procedures.' },
      { icon: 'Wifi', title: 'Network Management', description: 'Proactive network monitoring, configuration management, performance optimisation, and security hardening for LAN/WAN/WiFi infrastructure.' },
      { icon: 'Cloud', title: 'Cloud Migration & Management', description: 'Seamless migration to AWS, Azure, or GCP with architecture design, cost optimisation, and ongoing cloud management services.' },
      { icon: 'HardDrive', title: 'Infrastructure Management', description: 'Server provisioning, virtualisation, storage management, and infrastructure monitoring with automated alerting and remediation.' },
      { icon: 'ShieldCheck', title: 'Disaster Recovery', description: 'Business continuity planning, automated backups, failover systems, and tested recovery procedures to minimise downtime.' },
      { icon: 'Settings', title: 'IT Asset Management', description: 'Complete lifecycle management of hardware and software assets — procurement, tracking, licensing, and retirement.' },
    ],
    process: [
      { step: 1, title: 'Infrastructure Audit', description: 'We assess your current IT environment, identify risks, gaps, and opportunities for optimisation through comprehensive audits and stakeholder interviews.' },
      { step: 2, title: 'Strategy & Planning', description: 'We develop a tailored IT strategy with SLA definitions, escalation matrices, and a phased roadmap for improvements and migrations.' },
      { step: 3, title: 'Implementation & Migration', description: 'Certified engineers execute infrastructure upgrades, cloud migrations, and security hardening with minimal business disruption.' },
      { step: 4, title: 'Managed Services & Optimisation', description: 'Ongoing monitoring, proactive maintenance, regular reporting, and continuous improvement to keep your IT environment healthy and secure.' },
    ],
    technologies: ['AWS', 'Microsoft Azure', 'VMware', 'Cisco', 'Fortinet', 'Zabbix', 'Nagios', 'ServiceNow', 'Active Directory', 'Office 365', 'Veeam', 'Datadog'],
    differentiators: [
      { stat: '15 min', label: 'Avg. Response Time', description: 'Our helpdesk team responds to critical tickets within 15 minutes, ensuring minimal business disruption.' },
      { stat: '99.95%', label: 'Uptime Achieved', description: 'Proactive monitoring and rapid remediation deliver industry-leading uptime for our managed clients.' },
      { stat: '500+', label: 'Tickets Resolved/Month', description: 'Our experienced support team efficiently handles high-volume ticket loads without compromising quality.' },
      { stat: '30%', label: 'IT Cost Reduction', description: 'Strategic cloud migration and infrastructure optimisation typically reduce IT operational costs by 30% or more.' },
    ],
    pricing: [
      { name: 'Basic', price: '₹25,000/mo', features: ['8×5 helpdesk support', 'Up to 50 endpoints monitored', 'Monthly health reports', 'Patch management', 'Email support', '4-hour response SLA'], highlighted: false },
      { name: 'Professional', price: '₹75,000/mo', features: ['24/7 helpdesk support', 'Up to 200 endpoints', 'Network monitoring & management', 'Cloud management (1 platform)', 'Disaster recovery planning', '1-hour response SLA'], highlighted: true },
      { name: 'Enterprise', price: 'Custom', features: ['Dedicated support team', 'Unlimited endpoints', 'Full infrastructure management', 'Multi-cloud management', 'Business continuity assurance', '15-minute response SLA'], highlighted: false },
    ],
    faq: [
      { question: 'What is included in your helpdesk support?', answer: 'Our helpdesk covers L1 through L3 support including troubleshooting, configuration changes, user account management, software installations, and escalation to specialists for complex issues.' },
      { question: 'Can you manage our existing cloud infrastructure?', answer: 'Yes. We manage AWS, Azure, and GCP environments. Our cloud engineers handle cost optimisation, security hardening, performance tuning, and scaling — whether we migrated you or not.' },
      { question: 'How quickly can you respond to critical issues?', answer: 'Our SLA guarantees 15-minute response for critical issues on Enterprise plans, 1 hour on Professional, and 4 hours on Basic. Actual response times are typically faster than SLA commitments.' },
      { question: 'Do you provide on-site support?', answer: 'Yes. While most issues are resolved remotely, we provide on-site support for hardware installations, network cabling, and issues that require physical presence, especially in the Navi Mumbai region.' },
      { question: 'What reporting do you provide?', answer: 'We provide monthly health reports covering uptime metrics, ticket analysis, security updates, and infrastructure recommendations. Enterprise clients receive weekly dashboards and quarterly business reviews.' },
    ],
  },

  'digital-marketing': {
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    tagline: 'Amplify your brand in the digital space',
    description:
      'ABWcurious delivers data-driven digital marketing strategies that drive traffic, generate leads, and grow your brand. Our comprehensive services span SEO, SEM, social media management, content marketing, PPC campaigns, and brand growth solutions powered by analytics and AI. We combine creative storytelling with technical precision to deliver measurable results for businesses across India.',
    accentRgb: '251, 191, 36',
    features: [
      { icon: 'Search', title: 'SEO & Content Strategy', description: 'Technical SEO audits, keyword research, content calendars, and on-page optimisation that drive sustainable organic traffic growth.' },
      { icon: 'Megaphone', title: 'PPC & SEM Campaigns', description: 'High-ROI paid campaigns on Google Ads, Bing, and social platforms with A/B testing, bid optimisation, and conversion tracking.' },
      { icon: 'Share2', title: 'Social Media Management', description: 'End-to-end social media strategy, content creation, community management, and influencer partnerships across all major platforms.' },
      { icon: 'LineChart', title: 'Analytics & Attribution', description: 'Multi-touch attribution, funnel analysis, and custom dashboards that connect marketing spend to revenue with full transparency.' },
      { icon: 'PenTool', title: 'Content Marketing', description: 'Articles, whitepapers, case studies, video scripts, and email campaigns that position your brand as a thought leader.' },
      { icon: 'Mail', title: 'Email Marketing & Automation', description: 'Segmented email campaigns, drip sequences, and marketing automation workflows that nurture leads and drive conversions.' },
    ],
    process: [
      { step: 1, title: 'Audit & Research', description: 'We audit your current digital presence, analyse competitors, identify keyword opportunities, and benchmark performance metrics.' },
      { step: 2, title: 'Strategy Development', description: 'We craft a multi-channel marketing strategy with clear KPIs, budget allocation, content themes, and campaign timelines.' },
      { step: 3, title: 'Execution & Launch', description: 'Campaign setup, content production, ad creative development, and platform configuration with conversion tracking and analytics.' },
      { step: 4, title: 'Optimisation & Scaling', description: 'Continuous A/B testing, bid adjustments, content iteration, and budget reallocation based on performance data to maximise ROI.' },
    ],
    technologies: ['Google Analytics', 'Google Ads', 'SEMrush', 'Ahrefs', 'Meta Ads Manager', 'HubSpot', 'Mailchimp', 'Canva', 'Hootsuite', 'Hotjar', 'Tag Manager', 'Looker Studio'],
    differentiators: [
      { stat: '5x', label: 'Avg. ROI on Ads', description: 'Our data-driven campaign management consistently delivers 5x return on ad spend across industries.' },
      { stat: '200%', label: 'Organic Traffic Growth', description: 'Clients see an average 200% increase in organic traffic within 6 months of our SEO programmes.' },
      { stat: '10K+', label: 'Leads Generated', description: 'Our campaigns have generated over 10,000 qualified leads for businesses across technology, healthcare, and education.' },
      { stat: '50+', label: 'Brands Scaled', description: 'From startups to enterprises, we\'ve helped 50+ brands establish and grow their digital presence effectively.' },
    ],
    pricing: [
      { name: 'Basic', price: '₹20,000/mo', features: ['SEO audit & on-page optimisation', '2 articles per month', 'Social media (2 platforms)', 'Monthly performance report', 'Basic keyword tracking'], highlighted: false },
      { name: 'Professional', price: '₹60,000/mo', features: ['Full SEO & content strategy', 'PPC campaign management', 'Social media (4 platforms)', 'Email marketing automation', 'Bi-weekly reports & dashboards', 'Dedicated account manager'], highlighted: true },
      { name: 'Enterprise', price: 'Custom', features: ['Multi-channel strategy', 'Unlimited content production', 'Influencer partnerships', 'Advanced analytics & attribution', 'CRO & landing page optimisation', 'Quarterly strategy reviews'], highlighted: false },
    ],
    faq: [
      { question: 'How long does it take to see SEO results?', answer: 'SEO is a long-term strategy. You can expect to see noticeable improvements in 3-4 months and significant traffic growth by 6 months. Our strategies focus on sustainable, compounding results rather than quick fixes.' },
      { question: 'What platforms do you advertise on?', answer: 'We manage campaigns across Google Ads (Search, Display, YouTube), Meta (Facebook & Instagram), LinkedIn, Twitter, and programmatic platforms. We select channels based on your target audience and goals.' },
      { question: 'How do you measure marketing ROI?', answer: 'We set up conversion tracking, multi-touch attribution, and custom dashboards that connect every marketing dollar to measurable outcomes — leads, sales, and revenue.' },
      { question: 'Do you create content in-house?', answer: 'Yes. Our in-house team includes copywriters, designers, and video producers who create all content. This ensures brand consistency and faster turnaround times.' },
      { question: 'Can you manage our social media accounts?', answer: 'Absolutely. We handle content creation, scheduling, community management, and reporting across Instagram, Facebook, LinkedIn, Twitter, and YouTube.' },
    ],
  },

  'amc': {
    name: 'AMC (Annual Maintenance Contract)',
    slug: 'amc',
    tagline: 'Proactive care for your technology investment',
    description:
      'ABWcurious\'s Annual Maintenance Contracts provide comprehensive, proactive care for your IT infrastructure and security systems. Our AMC services cover regular maintenance, security patching, firmware upgrades, performance optimisation, and priority support — ensuring your systems remain secure, efficient, and up-to-date throughout the year. With flexible plans and dedicated account managers, we keep your technology running at its best.',
    accentRgb: '8, 145, 178',
    features: [
      { icon: 'Wrench', title: 'Preventive Maintenance', description: 'Scheduled maintenance visits, system health checks, and proactive component replacement to prevent failures before they occur.' },
      { icon: 'RefreshCw', title: 'Patching & Upgrades', description: 'Timely security patches, firmware updates, and software upgrades that keep your systems protected against known vulnerabilities.' },
      { icon: 'Clock', title: 'Priority Support', description: 'AMC clients receive priority queue placement with guaranteed response and resolution times significantly faster than standard support.' },
      { icon: 'FileText', title: 'Detailed Reporting', description: 'Monthly and quarterly reports covering maintenance activities, system health, resolved issues, and recommendations for improvement.' },
      { icon: 'CalendarCheck', title: 'Scheduled Site Visits', description: 'Regular on-site visits by certified engineers for physical inspections, cleaning, calibration, and hardware assessments.' },
      { icon: 'ShieldCheck', title: 'Warranty Extension', description: 'AMC coverage extends the effective warranty on your systems, covering labour and select replacement parts at no additional cost.' },
    ],
    process: [
      { step: 1, title: 'System Inventory & Baseline', description: 'We catalog all covered systems, establish performance baselines, and document current configurations for comprehensive coverage.' },
      { step: 2, title: 'Maintenance Schedule Design', description: 'We create a customised maintenance calendar with visit frequencies, patch schedules, and health check intervals tailored to your systems.' },
      { step: 3, title: 'Execution & Monitoring', description: 'Certified engineers perform scheduled maintenance, apply patches, run diagnostics, and document all activities in your service portal.' },
      { step: 4, title: 'Review & Optimisation', description: 'Quarterly business reviews analyse system trends, identify potential issues, and recommend upgrades or adjustments to your AMC scope.' },
    ],
    technologies: ['Zabbix', 'Nagios', 'ServiceNow', 'Veeam', 'WSUS', 'Ansible', 'Terraform', 'PagerDuty', 'Jira Service Management', 'ConnectWise', 'TeamViewer', 'AnyDesk'],
    differentiators: [
      { stat: '98%', label: 'Issue Prevention Rate', description: 'Our proactive maintenance approach prevents 98% of potential system failures before they impact your business.' },
      { stat: '4 hrs', label: 'Max Resolution Time', description: 'Critical issues under AMC are resolved within 4 hours, minimising downtime and business disruption.' },
      { stat: '100%', label: 'Patch Compliance', description: 'We ensure 100% compliance with critical security patches within 48 hours of release across all covered systems.' },
      { stat: '40%', label: 'Cost Savings vs Break-Fix', description: 'AMC clients save an average of 40% compared to ad-hoc break-fix support, with predictable annual costs.' },
    ],
    pricing: [
      { name: 'Basic', price: '₹18,000/yr', features: ['Quarterly maintenance visits', 'Remote monitoring', 'Email & phone support', 'Security patch deployment', 'Annual system health report', '8×5 support hours'], highlighted: false },
      { name: 'Professional', price: '₹55,000/yr', features: ['Monthly maintenance visits', '24/7 remote monitoring', 'Priority support queue', 'Firmware & software upgrades', 'Monthly health reports', 'On-site emergency response'], highlighted: true },
      { name: 'Enterprise', price: 'Custom', features: ['Dedicated account manager', 'Bi-weekly maintenance visits', 'Comprehensive SLA coverage', 'Spare parts & replacement pool', 'Real-time dashboard access', 'Quarterly optimisation reviews'], highlighted: false },
    ],
    faq: [
      { question: 'What systems are covered under AMC?', answer: 'We cover IT infrastructure (servers, networks, workstations), security systems (CCTV, access control, intrusion detection), and software platforms. Coverage is customised based on your specific systems and requirements.' },
      { question: 'How is AMC different from break-fix support?', answer: 'AMC is proactive — we prevent issues through regular maintenance, monitoring, and patching. Break-fix is reactive and often more expensive. AMC provides predictable costs and significantly fewer unexpected downtime events.' },
      { question: 'What happens if a system fails outside business hours?', answer: 'Professional and Enterprise AMC plans include 24/7 emergency support. Our on-call engineers respond immediately to critical failures, even during nights, weekends, and holidays.' },
      { question: 'Are replacement parts included in the AMC?', answer: 'Basic and Professional plans cover labour and basic consumables. Enterprise plans include a spare parts pool and coverage for select replacement components. Full parts coverage can be added to any plan.' },
      { question: 'Can I upgrade my AMC plan mid-contract?', answer: 'Yes. You can upgrade your AMC plan at any time. We\'ll adjust the pricing pro-rata for the remaining contract period and immediately enhance your coverage level.' },
    ],
  },

  'hiring-and-career-guidance': {
    name: 'Hiring and Career Guidance',
    slug: 'hiring-and-career-guidance',
    tagline: 'Bridging talent with opportunity',
    description:
      'ABWcurious connects exceptional talent with leading organisations through our comprehensive hiring and career guidance services. We provide professional recruitment, skill assessment, career counselling, interview preparation, resume building workshops, and industry-relevant training programmes. Whether you\'re a company seeking top cybersecurity and IT talent, or a professional looking to advance your career, ABWcurious is your trusted partner.',
    accentRgb: '124, 58, 237',
    features: [
      { icon: 'UserPlus', title: 'Professional Recruitment', description: 'End-to-end recruitment for cybersecurity, AI/ML, and IT roles — from sourcing and screening to interview coordination and offer management.' },
      { icon: 'ClipboardList', title: 'Skill Assessment', description: 'Rigorous technical and behavioural assessments that evaluate candidates on real-world skills, not just credentials, ensuring quality hires.' },
      { icon: 'GraduationCap', title: 'Training Programmes', description: 'Industry-aligned training in cybersecurity, cloud computing, AI/ML, and full-stack development with hands-on labs and certification prep.' },
      { icon: 'Briefcase', title: 'Interview Preparation', description: 'Mock interviews, technical challenges, and behavioural coaching that prepare candidates to confidently ace interviews at top companies.' },
      { icon: 'BookOpen', title: 'Resume & Profile Building', description: 'ATS-optimised resume writing, LinkedIn profile optimisation, and portfolio development that get you noticed by recruiters.' },
      { icon: 'Handshake', title: 'Campus Placements', description: 'Partnerships with colleges and universities for campus recruitment drives, pre-placement training, and industry-readiness programmes.' },
    ],
    process: [
      { step: 1, title: 'Needs Analysis & Profiling', description: 'For employers, we define role requirements, skill specifications, and cultural fit criteria. For candidates, we assess current skills and career aspirations.' },
      { step: 2, title: 'Sourcing & Assessment', description: 'We leverage our talent network, job portals, and social platforms to source candidates. Each candidate undergoes our multi-stage skill assessment.' },
      { step: 3, title: 'Matching & Interviewing', description: 'Shortlisted candidates are presented with detailed assessment reports. We coordinate interviews and provide both parties with preparation resources.' },
      { step: 4, title: 'Onboarding & Follow-Up', description: 'Post-placement, we facilitate smooth onboarding and follow up at 30/60/90 days to ensure satisfaction and retention for both parties.' },
    ],
    technologies: ['HackerRank', 'LinkedIn Recruiter', 'ATS Platforms', 'Zoom', 'Google Workspace', 'Assessment Tools', 'CRM Systems', 'Slack', 'Notion', 'Calendly', 'Typeform', 'Canvas LMS'],
    differentiators: [
      { stat: '95%', label: 'Placement Success Rate', description: '95% of candidates who complete our training and guidance programme secure positions within 60 days.' },
      { stat: '500+', label: 'Talent Pool', description: 'Our curated talent pool of 500+ vetted cybersecurity and IT professionals is ready for immediate deployment.' },
      { stat: '30 days', label: 'Avg. Time-to-Hire', description: 'Our efficient matching process reduces time-to-hire to an average of 30 days from requirement to onboarding.' },
      { stat: '85%', label: 'Retention at 1 Year', description: 'Candidates placed through ABWcurious show 85% retention at the one-year mark — well above industry average.' },
    ],
    pricing: [
      { name: 'Basic', price: '₹15,000', features: ['Resume review & optimisation', 'Career counselling session', 'Job matching (3 opportunities)', 'Interview tips & resources', '1-month platform access'], highlighted: false },
      { name: 'Professional', price: '₹45,000', features: ['Full career guidance programme', 'Skill assessment & gap analysis', '5 mock interviews', 'LinkedIn profile optimisation', 'Unlimited job matching', '3-month platform access'], highlighted: true },
      { name: 'Enterprise', price: 'Custom', features: ['Bulk recruitment services', 'Custom assessment design', 'Campus placement drives', 'Pre-placement training', 'Dedicated recruitment manager', 'SLA-backed hiring timelines'], highlighted: false },
    ],
    faq: [
      { question: 'What industries do you recruit for?', answer: 'We specialise in cybersecurity, AI/ML, IT infrastructure, cloud computing, software development, and digital marketing roles. Our network spans technology, BFSI, healthcare, and education sectors.' },
      { question: 'How do you assess candidate skills?', answer: 'We use a combination of technical assessments (coding challenges, scenario-based tests), behavioural interviews, and practical lab exercises. Our assessments are designed to evaluate real-world job readiness.' },
      { question: 'Do you offer training before placement?', answer: 'Yes. We offer comprehensive training programmes in cybersecurity (CEH, CompTIA Security+), cloud (AWS, Azure), AI/ML, and full-stack development. Programmes include hands-on labs and certification preparation.' },
      { question: 'What is your replacement guarantee?', answer: 'For employers, we offer a 90-day replacement guarantee. If a placed candidate leaves or doesn\'t meet expectations within 90 days, we provide a replacement at no additional recruitment fee.' },
      { question: 'Can freshers enrol in your career guidance programme?', answer: 'Absolutely. Our programme is designed for both freshers and experienced professionals. Freshers receive additional support including foundational training, internship placements, and career path planning.' },
    ],
  },
};

/* ================================================================== */
/*  SLUG ALIASES — map old slugs to new canonical slugs                */
/* ================================================================== */
const slugAliases: Record<string, string> = {
  'electronic-security-system': 'electronic-security-systems',
  'application-development': 'software-application-development',
  'it-supports': 'software-it-solutions',
  'amc': 'amc-annual-maintenance-contracts',
  'hiring-and-career-guidance': 'career-guidance-hiring',
};

/* ================================================================== */
/*  SERVICE SUMMARY MAP — lightweight data for ALL 32 services         */
/*  Used as fallback when detailed data isn't in servicesData          */
/* ================================================================== */
type ServiceCategory = 'security' | 'digital' | 'learning';

interface ServiceSummary {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  accentRgb: string;
  category: ServiceCategory;
}

const serviceSummaryMap: Record<string, ServiceSummary> = {
  // ── Security ──
  'cctv-surveillance': { name: 'CCTV Surveillance', slug: 'cctv-surveillance', tagline: 'Eyes that never blink', description: 'Advanced CCTV surveillance systems with AI-powered analytics, remote monitoring, night vision, and cloud storage for round-the-clock security coverage.', accentRgb: '8, 145, 178', category: 'security' },
  'cyber-security': { name: 'Cyber Security', slug: 'cyber-security', tagline: 'Fortress for your digital world', description: 'End-to-end cybersecurity solutions protecting your digital assets with threat intelligence, incident response, compliance management, and proactive defense strategies.', accentRgb: '8, 145, 178', category: 'security' },
  'vapt': { name: 'VAPT — Vulnerability Assessment & Penetration Testing', slug: 'vapt', tagline: 'Find weaknesses before attackers do', description: 'Comprehensive vulnerability assessments and penetration testing to identify security gaps, simulate real-world attacks, and fortify your infrastructure against threats.', accentRgb: '8, 145, 178', category: 'security' },
  'digital-forensics': { name: 'Digital Forensics', slug: 'digital-forensics', tagline: 'Truth from digital evidence', description: 'Expert digital forensic investigation services including data recovery, evidence analysis, incident reconstruction, and courtroom-ready reporting for cyber incidents.', accentRgb: '8, 145, 178', category: 'security' },
  'antivirus-malware-protection': { name: 'Antivirus & Malware Protection', slug: 'antivirus-malware-protection', tagline: 'Real-time threat elimination', description: 'Enterprise-grade antivirus and anti-malware solutions with real-time threat detection, zero-day protection, automated remediation, and centralized management.', accentRgb: '8, 145, 178', category: 'security' },
  'intrusion-detection-systems': { name: 'IDS — Intrusion Detection Systems', slug: 'intrusion-detection-systems', tagline: 'Watchful guardian of your network', description: 'Network and host-based intrusion detection systems with real-time alerting, anomaly detection, deep packet inspection, and seamless SIEM integration.', accentRgb: '8, 145, 178', category: 'security' },
  'electronic-security-systems': { name: 'Electronic Security Systems', slug: 'electronic-security-systems', tagline: 'Complete physical security', description: 'Integrated electronic security solutions — access control, biometric systems, alarm monitoring, intercoms, and perimeter protection for complete physical security.', accentRgb: '8, 145, 178', category: 'security' },
  'security-operations-center': { name: 'SOC — Security Operations Center', slug: 'security-operations-center', tagline: '24/7 vigilance, zero compromise', description: '24/7 Security Operations Center with continuous monitoring, threat hunting, incident response orchestration, and compliance reporting for enterprise security.', accentRgb: '8, 145, 178', category: 'security' },
  // ── Digital ──
  'digital-marketing': { name: 'Digital Marketing', slug: 'digital-marketing', tagline: 'Amplify your brand reach', description: 'Data-driven marketing strategies, SEO/SEM optimization, social media management, content marketing, PPC campaigns, and brand growth solutions powered by analytics and AI.', accentRgb: '251, 191, 36', category: 'digital' },
  'software-it-solutions': { name: 'Software & IT Solutions', slug: 'software-it-solutions', tagline: 'Technology that drives growth', description: 'Custom software development and IT solutions tailored to your business — from enterprise systems and APIs to legacy modernization and cloud-native architectures.', accentRgb: '251, 191, 36', category: 'digital' },
  'website-development': { name: 'Website Development', slug: 'website-development', tagline: 'Websites that convert visitors into customers', description: 'Custom websites and web applications built with cutting-edge technologies, responsive design, SEO optimization, and enterprise-grade architecture for maximum performance.', accentRgb: '251, 191, 36', category: 'digital' },
  'software-application-development': { name: 'Software Application Development', slug: 'software-application-development', tagline: 'Apps that users love', description: 'Native and cross-platform mobile applications with intuitive UX, high performance, scalable backend systems, and seamless third-party integrations.', accentRgb: '251, 191, 36', category: 'digital' },
  'saas-solutions': { name: 'SaaS Solutions', slug: 'saas-solutions', tagline: 'Scale without limits', description: 'Scalable Software-as-a-Service platforms with multi-tenant architecture, subscription billing, auto-scaling, and continuous delivery for rapid market deployment.', accentRgb: '251, 191, 36', category: 'digital' },
  'ai-solutions': { name: 'AI Solutions', slug: 'ai-solutions', tagline: 'Intelligence built for business', description: 'Cutting-edge AI/ML solutions including predictive analytics, natural language processing, computer vision, and intelligent automation to transform your business operations.', accentRgb: '251, 191, 36', category: 'digital' },
  'lead-generation': { name: 'Lead Generation', slug: 'lead-generation', tagline: 'Pipeline that never dries', description: 'Strategic lead generation campaigns with AI-powered prospecting, multi-channel outreach, conversion optimization, and CRM integration for consistent pipeline growth.', accentRgb: '251, 191, 36', category: 'digital' },
  'crm-solutions': { name: 'CRM Solutions', slug: 'crm-solutions', tagline: 'Nurture every relationship', description: 'Customer Relationship Management solutions with sales pipeline automation, contact management, analytics dashboards, and seamless integration with marketing tools.', accentRgb: '251, 191, 36', category: 'digital' },
  'amc-annual-maintenance-contracts': { name: 'AMC — Annual Maintenance Contracts', slug: 'amc-annual-maintenance-contracts', tagline: 'Worry-free IT operations', description: 'Annual Maintenance Contracts for comprehensive IT infrastructure management, regular updates, security patching, dedicated support, and performance optimization.', accentRgb: '251, 191, 36', category: 'digital' },
  'server-management': { name: 'Server Management', slug: 'server-management', tagline: '99.99% uptime guaranteed', description: 'Enterprise server management with proactive monitoring, load balancing, auto-scaling, disaster recovery, and 99.99% uptime guarantees for mission-critical systems.', accentRgb: '251, 191, 36', category: 'digital' },
  'work-automations': { name: 'Work Automations', slug: 'work-automations', tagline: 'Eliminate manual tasks', description: 'Intelligent workflow automation solutions — RPA, process orchestration, API integrations, and custom automation pipelines that eliminate manual tasks and boost efficiency.', accentRgb: '251, 191, 36', category: 'digital' },
  'banner-designing': { name: 'Banner Designing', slug: 'banner-designing', tagline: 'Designs that demand attention', description: 'Eye-catching banner design for web, social media, and print — crafted with brand consistency, compelling visuals, and conversion-focused layouts.', accentRgb: '251, 191, 36', category: 'digital' },
  'posters-flyers': { name: 'Posters & Flyers', slug: 'posters-flyers', tagline: 'Visuals that leave an impact', description: 'High-impact poster and flyer designs for events, promotions, and brand campaigns — combining striking visuals with clear messaging for maximum engagement.', accentRgb: '251, 191, 36', category: 'digital' },
  'ads-shooting-production': { name: 'Ads Shooting & Production', slug: 'ads-shooting-production', tagline: 'From concept to screen', description: 'Professional ad film production from concept to delivery — scripting, shooting, editing, motion graphics, and multi-platform optimization for maximum reach.', accentRgb: '251, 191, 36', category: 'digital' },
  'pamphlets-brochures': { name: 'Pamphlets & Brochures', slug: 'pamphlets-brochures', tagline: 'Print that persuades', description: 'Professionally designed pamphlets and brochures with compelling layouts, brand-aligned visuals, and persuasive copy for print and digital distribution.', accentRgb: '251, 191, 36', category: 'digital' },
  // ── Learning / Careers ──
  'professional-training': { name: 'Professional Training', slug: 'professional-training', tagline: 'Skills that open doors', description: 'Industry-aligned professional training programs with expert instructors, hands-on labs, real-world projects, and certifications across cybersecurity, cloud, and AI domains.', accentRgb: '124, 58, 237', category: 'learning' },
  'internships': { name: 'Internships', slug: 'internships', tagline: 'Launch your career', description: 'Immersive internship programs with mentorship, real project experience, industry exposure, and placement assistance to launch your career in technology.', accentRgb: '124, 58, 237', category: 'learning' },
  'ai-tutor': { name: 'AI Tutor', slug: 'ai-tutor', tagline: 'Personalized learning at scale', description: 'AI-powered personalized tutoring with adaptive learning paths, instant doubt resolution, progress tracking, and intelligent recommendations for accelerated skill mastery.', accentRgb: '124, 58, 237', category: 'learning' },
  'certifications': { name: 'Certifications', slug: 'certifications', tagline: 'Credentials that matter', description: 'Globally recognized certification programs in cybersecurity, cloud computing, AI/ML, and project management with exam prep, practice tests, and credential verification.', accentRgb: '124, 58, 237', category: 'learning' },
  'online-courses': { name: 'Online Courses', slug: 'online-courses', tagline: 'Learn anytime, anywhere', description: 'Self-paced online courses with video lectures, interactive assignments, peer communities, and completion certificates — learn anytime, anywhere, on any device.', accentRgb: '124, 58, 237', category: 'learning' },
  'skill-development-programs': { name: 'Skill Development Programs', slug: 'skill-development-programs', tagline: 'Fast-track your growth', description: 'Accelerated skill development bootcamps and workshops focused on in-demand technologies, soft skills, and leadership to fast-track your professional growth.', accentRgb: '124, 58, 237', category: 'learning' },
  'research-programs': { name: 'Research Programs', slug: 'research-programs', tagline: 'Discover what\'s next', description: 'Collaborative research programs in AI, cybersecurity, and emerging technologies with academic partnerships, publication support, and innovation grants.', accentRgb: '124, 58, 237', category: 'learning' },
  'innovation-programs': { name: 'Innovation Programs', slug: 'innovation-programs', tagline: 'From idea to impact', description: 'Innovation incubation programs with ideation workshops, prototype development, mentorship from industry leaders, and startup acceleration support.', accentRgb: '124, 58, 237', category: 'learning' },
  'career-guidance-hiring': { name: 'Career Guidance & Hiring', slug: 'career-guidance-hiring', tagline: 'Bridging talent with opportunity', description: 'Professional recruitment services, career counseling, skill assessment, interview preparation, resume building workshops, and industry-relevant hiring programs.', accentRgb: '124, 58, 237', category: 'learning' },
};

/* ================================================================== */
/*  CATEGORY-BASED TEMPLATES — generate data for services without      */
/*  detailed entries in servicesData                                    */
/* ================================================================== */

const categoryTemplates: Record<ServiceCategory, {
  features: Feature[];
  process: ProcessStep[];
  technologies: string[];
  differentiators: Differentiator[];
  pricing: PricingTier[];
  faq: FAQItem[];
}> = {
  security: {
    features: [
      { icon: 'Shield', title: 'Threat Detection & Prevention', description: 'Proactive identification and neutralization of security threats using advanced monitoring and AI-driven analysis.' },
      { icon: 'Lock', title: 'Compliance & Governance', description: 'Ensure regulatory compliance with industry standards including ISO 27001, SOC 2, GDPR, and HIPAA frameworks.' },
      { icon: 'Eye', title: '24/7 Monitoring & Response', description: 'Round-the-clock security monitoring with rapid incident response and escalation procedures.' },
      { icon: 'Fingerprint', title: 'Access Control & Identity', description: 'Multi-factor authentication, role-based access, and identity governance to protect critical assets.' },
      { icon: 'Scan', title: 'Vulnerability Management', description: 'Continuous scanning, assessment, and remediation of vulnerabilities across your infrastructure.' },
      { icon: 'AlarmCheck', title: 'Incident Recovery', description: 'Rapid recovery procedures, forensic analysis, and post-incident hardening to prevent recurrence.' },
    ],
    process: [
      { step: 1, title: 'Security Assessment', description: 'Comprehensive evaluation of your current security posture, identifying gaps, risks, and compliance requirements.' },
      { step: 2, title: 'Solution Design', description: 'Custom security architecture designed for your specific threat landscape and business requirements.' },
      { step: 3, title: 'Implementation & Integration', description: 'Deploy security solutions with minimal disruption, integrating seamlessly with existing systems and workflows.' },
      { step: 4, title: 'Monitoring & Optimization', description: 'Continuous monitoring, regular assessments, and ongoing optimization to stay ahead of evolving threats.' },
    ],
    technologies: ['SIEM', 'EDR/XDR', 'Firewalls', 'WAF', 'DLP', 'IAM', 'Zero Trust', 'SOC Tools', 'Wireshark', 'Nessus', 'Burp Suite', 'Splunk'],
    differentiators: [
      { stat: '99.9%', label: 'Threat Detection Rate', description: 'Our advanced monitoring detects 99.9% of threats before they impact your operations.' },
      { stat: '<15min', label: 'Incident Response', description: 'Average incident response time under 15 minutes with 24/7 security operations coverage.' },
      { stat: '100+', label: 'Security Modules', description: 'Over 100 specialized security modules covering every aspect of enterprise protection.' },
      { stat: '50+', label: 'Compliance Frameworks', description: 'Expertise across 50+ regulatory and compliance frameworks for global operations.' },
    ],
    pricing: [
      { name: 'Starter', price: '₹25,000/mo', features: ['Basic threat monitoring', 'Email security', 'Weekly vulnerability scans', 'Incident alerting', 'Monthly security report'], highlighted: false },
      { name: 'Business', price: '₹75,000/mo', features: ['24/7 SOC monitoring', 'Endpoint protection', 'Penetration testing (quarterly)', 'Compliance reporting', 'Dedicated security analyst', 'Incident response SLA'], highlighted: true },
      { name: 'Enterprise', price: 'Custom', features: ['Full security operations', 'Custom compliance framework', 'Red team exercises', 'Executive security briefings', 'Dedicated security team', 'Board-level reporting'], highlighted: false },
    ],
    faq: [
      { question: 'What compliance frameworks do you support?', answer: 'We support ISO 27001, SOC 2, GDPR, HIPAA, PCI DSS, and many more. Our team tailors compliance strategies to your industry and regulatory requirements.' },
      { question: 'How quickly can you respond to security incidents?', answer: 'Our 24/7 SOC provides real-time monitoring with an average response time of under 15 minutes for critical security incidents.' },
      { question: 'Do you offer security training for our team?', answer: 'Yes, we provide comprehensive security awareness training, phishing simulations, and role-specific security education for your entire organization.' },
      { question: 'Can you integrate with our existing security tools?', answer: 'Absolutely. Our solutions are designed to integrate with popular SIEM, EDR, SOAR, and other security platforms for unified visibility and response.' },
    ],
  },
  digital: {
    features: [
      { icon: 'Code2', title: 'Custom Development', description: 'Tailored solutions built from the ground up using modern tech stacks, agile methodologies, and industry best practices.' },
      { icon: 'Cloud', title: 'Cloud-Ready Architecture', description: 'Scalable cloud-native architectures optimized for performance, cost efficiency, and seamless deployment across providers.' },
      { icon: 'BarChart3', title: 'Data-Driven Insights', description: 'Analytics dashboards and reporting tools that turn raw data into actionable business intelligence.' },
      { icon: 'Smartphone', title: 'Cross-Platform Delivery', description: 'Solutions optimized for all devices and platforms with responsive design and native performance.' },
      { icon: 'RefreshCw', title: 'Agile & Iterative', description: 'Rapid prototyping and iterative development cycles that adapt to changing requirements and market feedback.' },
      { icon: 'Settings', title: 'Ongoing Support', description: 'Dedicated support, maintenance, and continuous improvement to keep your solutions running at peak performance.' },
    ],
    process: [
      { step: 1, title: 'Discovery & Strategy', description: 'We analyze your business goals, target audience, and competitive landscape to define a clear project strategy.' },
      { step: 2, title: 'Design & Prototype', description: 'UI/UX design and interactive prototyping that validates concepts before development begins.' },
      { step: 3, title: 'Development & Testing', description: 'Agile development with continuous testing, code reviews, and quality assurance at every sprint.' },
      { step: 4, title: 'Launch & Growth', description: 'Smooth deployment, performance monitoring, and iterative optimization based on real user data.' },
    ],
    technologies: ['React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'AWS', 'Azure', 'PostgreSQL', 'Docker', 'Kubernetes', 'Figma', 'Tailwind CSS'],
    differentiators: [
      { stat: '50+', label: 'Projects Delivered', description: 'Over 50 successful digital projects delivered across industries from startup MVPs to enterprise platforms.' },
      { stat: '3x', label: 'Faster Time-to-Market', description: 'Our agile processes and reusable components accelerate delivery by 3x compared to traditional approaches.' },
      { stat: '99.9%', label: 'Uptime SLA', description: 'Enterprise-grade reliability with 99.9% uptime guarantees for all production deployments.' },
      { stat: '20+', label: 'Technologies', description: 'Expertise across 20+ technologies enabling us to choose the right stack for every project.' },
    ],
    pricing: [
      { name: 'Starter', price: '₹50,000', features: ['Requirements analysis', 'UI/UX design', 'Core feature development', 'Responsive design', '1 month support'], highlighted: false },
      { name: 'Professional', price: '₹2,50,000', features: ['Full-stack development', 'API integrations', 'Performance optimization', 'SEO setup', '3 months support', 'Analytics dashboard'], highlighted: true },
      { name: 'Enterprise', price: 'Custom', features: ['Custom architecture design', 'Multi-team coordination', 'CI/CD pipeline setup', 'Security audit', '12 months support', 'Dedicated project manager'], highlighted: false },
    ],
    faq: [
      { question: 'What technologies do you work with?', answer: 'We work with React, Next.js, Node.js, Python, TypeScript, AWS, Azure, PostgreSQL, Docker, Kubernetes, and many more — selecting the best stack for each project\'s requirements.' },
      { question: 'How long does a typical project take?', answer: 'Project timelines vary by scope. An MVP typically takes 4-8 weeks, while enterprise solutions may take 3-6 months. We provide detailed timelines during the discovery phase.' },
      { question: 'Do you provide post-launch support?', answer: 'Yes, all projects include a support period. We also offer extended maintenance contracts and AMC packages for ongoing support and feature development.' },
      { question: 'Can you work with our existing team?', answer: 'Absolutely. We seamlessly integrate with in-house teams, providing additional capacity, specialized expertise, or full project delivery as needed.' },
    ],
  },
  learning: {
    features: [
      { icon: 'GraduationCap', title: 'Expert-Led Training', description: 'Courses designed and delivered by industry practitioners with years of real-world experience in their domains.' },
      { icon: 'Bot', title: 'AI-Powered Learning', description: 'Adaptive learning paths, intelligent recommendations, and instant doubt resolution powered by AI technology.' },
      { icon: 'Award', title: 'Industry Certifications', description: 'Globally recognized certifications that validate your skills and boost your career prospects.' },
      { icon: 'Briefcase', title: 'Career Support', description: 'Resume building, interview preparation, and placement assistance to help you land your dream role.' },
      { icon: 'BookOpen', title: 'Comprehensive Curriculum', description: 'Structured learning paths with hands-on labs, real-world projects, and progressive skill building.' },
      { icon: 'Users', title: 'Community & Mentorship', description: 'Join a vibrant community of learners with access to mentors, peer discussions, and networking opportunities.' },
    ],
    process: [
      { step: 1, title: 'Skill Assessment', description: 'Evaluate your current skill level and career goals to create a personalized learning roadmap.' },
      { step: 2, title: 'Structured Learning', description: 'Follow an expert-designed curriculum with video lectures, hands-on labs, and real-world projects.' },
      { step: 3, title: 'Practice & Projects', description: 'Apply your knowledge through practical assignments, capstone projects, and industry simulations.' },
      { step: 4, title: 'Certification & Placement', description: 'Earn your certification and leverage our career support services to secure your next opportunity.' },
    ],
    technologies: ['LMS Platforms', 'Zoom', 'Jupyter Notebooks', 'VS Code', 'GitHub', 'Docker', 'AWS Free Tier', 'Google Colab', 'HackerRank', 'Canvas LMS', 'Notion', 'Slack'],
    differentiators: [
      { stat: '1000+', label: 'Learners Trained', description: 'Over 1000 professionals have upskilled through our programs with a 92% completion rate.' },
      { stat: '92%', label: 'Completion Rate', description: 'Our engaging, project-based approach ensures 92% of learners complete their programs successfully.' },
      { stat: '85%', label: 'Placement Rate', description: '85% of our certified learners secure relevant positions within 90 days of program completion.' },
      { stat: '4.8/5', label: 'Satisfaction Score', description: 'Consistently rated 4.8 out of 5 by our learners for content quality and instructor expertise.' },
    ],
    pricing: [
      { name: 'Basic', price: '₹5,000', features: ['Self-paced video courses', 'Community forum access', 'Basic projects', 'Completion certificate', 'Email support'], highlighted: false },
      { name: 'Professional', price: '₹25,000', features: ['Instructor-led sessions', 'Hands-on labs & projects', 'Certification exam prep', '1-on-1 mentorship', 'Placement assistance', 'Lifetime access'], highlighted: true },
      { name: 'Enterprise', price: 'Custom', features: ['Custom training programs', 'Team dashboards', 'Skill gap analysis', 'Dedicated trainer', 'Certification vouchers', 'ROI reporting'], highlighted: false },
    ],
    faq: [
      { question: 'Who are the instructors?', answer: 'Our instructors are industry practitioners with 5+ years of experience in cybersecurity, AI/ML, cloud computing, and software development at leading organizations.' },
      { question: 'Are the certifications recognized?', answer: 'Yes, our certifications are recognized by industry partners and align with global standards. We also offer preparation for vendor certifications like AWS, CompTIA, and CEH.' },
      { question: 'Do you offer placement assistance?', answer: 'Absolutely. Our Professional and Enterprise plans include career counseling, resume reviews, mock interviews, and direct placement assistance through our hiring partner network.' },
      { question: 'Can I learn at my own pace?', answer: 'Yes, most of our courses offer flexible self-paced options with lifetime access. Instructor-led programs follow a structured schedule with recorded sessions for review.' },
    ],
  },
};

/* Resolve a service slug to full ServiceData, with fallback generation */
function resolveService(slug: string): ServiceData | null {
  // 1. Check detailed data first (may use old slug)
  if (servicesData[slug]) return servicesData[slug];

  // 2. Check alias map
  const resolvedSlug = slugAliases[slug] || slug;
  if (servicesData[resolvedSlug]) return servicesData[resolvedSlug];

  // 3. Check summary map for fallback generation
  const summary = serviceSummaryMap[slug] || serviceSummaryMap[resolvedSlug];
  if (!summary) return null;

  const template = categoryTemplates[summary.category];
  return {
    name: summary.name,
    slug: summary.slug,
    tagline: summary.tagline,
    description: summary.description,
    accentRgb: summary.accentRgb,
    features: template.features,
    process: template.process,
    technologies: template.technologies,
    differentiators: template.differentiators,
    pricing: template.pricing,
    faq: template.faq,
  };
}

/* ================================================================== */
/*  ANIMATION VARIANTS                                                 */
/* ================================================================== */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ================================================================== */
/*  FAQ ITEM COMPONENT                                                 */
/* ================================================================== */

function FAQItem({ item, accentRgb, isOpen, onToggle }: { item: FAQItem; accentRgb: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className="glass-card overflow-hidden transition-all duration-300"
      style={isOpen ? { borderColor: `rgba(${accentRgb}, 0.2)` } : undefined}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-foreground text-sm sm:text-base leading-snug">{item.question}</span>
        <ChevronDown
          className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
          style={{
            color: `rgba(${accentRgb}, 0.7)`,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-5 pb-5 text-foreground/70 text-sm leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */

export default function ServiceDetailPage() {
  const { page, goHome, navigate } = useNavigation();
  const slug = page.pageParams?.slug || '';
  const service = resolveService(slug);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* ──── Not Found ──── */
  if (!service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Shield className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
          <h1
            className="text-4xl font-bold text-foreground mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Service Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The service you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Button
            onClick={goHome}
            className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const accent = service.accentRgb;
  const accentColor = `rgb(${accent})`;

  const handleGetQuote = () => {
    window.dispatchEvent(new CustomEvent('abwcurious:open-auth', { detail: { mode: 'signup' } }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Sticky Back Navigation ─── */}
      <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={goHome}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={goHome} className="hover:text-primary transition-colors">Home</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{service.name}</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          1. HERO SECTION
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full pointer-events-none opacity-20"
          style={{ background: `radial-gradient(circle, rgba(${accent}, 0.15) 0%, transparent 70%)` }}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Tagline badge */}
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border"
                style={{
                  background: `rgba(${accent}, 0.06)`,
                  borderColor: `rgba(${accent}, 0.15)`,
                  color: accentColor,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {service.tagline}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(${accent}, 1), rgba(${accent}, 0.65))`,
                }}
              >
                {service.name}
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-foreground/70 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-8"
            >
              {service.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={handleGetQuote}
                size="lg"
                className="btn-glow font-semibold px-8 text-base"
                style={{
                  background: `linear-gradient(135deg, rgba(${accent}, 0.9), rgba(${accent}, 0.7))`,
                  color: '#ffffff',
                }}
              >
                Get a Quote
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('home')}
                className="font-semibold px-8 text-base border-border hover:bg-secondary/50"
              >
                Request Service
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══════════════════════════════════════════════════════════════════
          2. OVERVIEW SECTION
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
          >
            <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-4">
              Overview
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className="text-foreground">What Problems We </span>
              <span className="text-gradient-cyan">Solve</span>
            </h2>
            <p className="text-foreground/70 text-base sm:text-lg leading-relaxed max-w-4xl">
              {service.description}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══════════════════════════════════════════════════════════════════
          3. FEATURES SECTION
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
          >
            <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-4">
              Capabilities
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className="text-foreground">Key </span>
              <span className="text-gradient-holographic">Features</span>
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
          >
            {service.features.map((feature, i) => {
              const Icon = iconMap[feature.icon] || Zap;
              return (
                <motion.div
                  key={feature.title}
                  className="group"
                  variants={fadeUp}
                  custom={i}
                >
                  <div
                    className="glass-card p-5 sm:p-6 h-full transition-all duration-300 group-hover:scale-[1.02]"
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = `rgba(${accent}, 0.25)`;
                      el.style.boxShadow = `0 0 20px rgba(${accent}, 0.08), inset 0 0 15px rgba(${accent}, 0.03)`;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = '';
                      el.style.boxShadow = 'none';
                    }}
                  >
                    {/* Icon */}
                    <div className="mb-4 relative inline-flex">
                      <div
                        className="absolute inset-0 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                        style={{ backgroundColor: `rgba(${accent}, 0.3)` }}
                      />
                      <div
                        className="relative flex items-center justify-center w-11 h-11 rounded-lg border transition-all duration-300"
                        style={{
                          background: `rgba(${accent}, 0.06)`,
                          borderColor: `rgba(${accent}, 0.1)`,
                        }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: `rgba(${accent}, 0.9)` }}
                          strokeWidth={1.8}
                        />
                      </div>
                    </div>

                    <h3
                      className="font-bold text-foreground text-base mb-2"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══════════════════════════════════════════════════════════════════
          4. PROCESS SECTION
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
          >
            <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-4">
              Methodology
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className="text-foreground">How We </span>
              <span className="text-gradient-cyan">Work</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div
              className="absolute left-6 top-0 bottom-0 w-px hidden sm:block"
              style={{ background: `linear-gradient(180deg, rgba(${accent}, 0.3), rgba(${accent}, 0.05))` }}
            />

            <motion.div
              className="space-y-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
            >
              {service.process.map((step, i) => (
                <motion.div
                  key={step.step}
                  className="flex gap-5 sm:gap-8 relative"
                  variants={fadeUp}
                  custom={i}
                >
                  {/* Step number */}
                  <div className="flex-shrink-0 relative z-10">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2"
                      style={{
                        background: `rgba(${accent}, 0.08)`,
                        borderColor: `rgba(${accent}, 0.25)`,
                        color: accentColor,
                        fontFamily: 'var(--font-space-grotesk)',
                      }}
                    >
                      {step.step}
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className="glass-card p-5 sm:p-6 flex-1 transition-all duration-300"
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = `rgba(${accent}, 0.2)`;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = '';
                    }}
                  >
                    <h3
                      className="font-bold text-foreground text-base sm:text-lg mb-2"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══════════════════════════════════════════════════════════════════
          5. TECHNOLOGIES SECTION
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
          >
            <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-4">
              Tech Stack
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className="text-foreground">Technologies We </span>
              <span className="text-gradient-holographic">Use</span>
            </h2>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
          >
            {service.technologies.map((tech, i) => (
              <motion.span
                key={tech}
                variants={fadeUp}
                custom={i}
                className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 hover:scale-105 cursor-default"
                style={{
                  background: `rgba(${accent}, 0.04)`,
                  borderColor: `rgba(${accent}, 0.15)`,
                  color: `rgba(${accent}, 0.85)`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = `rgba(${accent}, 0.35)`;
                  el.style.background = `rgba(${accent}, 0.08)`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = `rgba(${accent}, 0.15)`;
                  el.style.background = `rgba(${accent}, 0.04)`;
                }}
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══════════════════════════════════════════════════════════════════
          6. WHY CHOOSE ABWCURIOUS SECTION
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none opacity-15"
          style={{ background: `radial-gradient(circle, rgba(${accent}, 0.15) 0%, transparent 70%)` }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
          >
            <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-4">
              Why Us
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className="text-foreground">Why Choose </span>
              <span className="text-gradient-cyan">ABWcurious</span>
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
          >
            {service.differentiators.map((diff, i) => (
              <motion.div
                key={diff.label}
                className="group"
                variants={fadeUp}
                custom={i}
              >
                <div
                  className="glass-card p-5 sm:p-6 text-center h-full transition-all duration-300 group-hover:scale-[1.02]"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = `rgba(${accent}, 0.25)`;
                    el.style.boxShadow = `0 0 20px rgba(${accent}, 0.08)`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = '';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div
                    className="text-3xl sm:text-4xl font-bold mb-2"
                    style={{
                      fontFamily: 'var(--font-space-grotesk)',
                      color: accentColor,
                    }}
                  >
                    {diff.stat}
                  </div>
                  <h3
                    className="font-semibold text-foreground text-sm mb-2"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {diff.label}
                  </h3>
                  <p className="text-foreground/60 text-xs leading-relaxed">
                    {diff.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══════════════════════════════════════════════════════════════════
          7. PRICING SECTION
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
          >
            <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-4">
              Pricing
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className="text-foreground">Transparent </span>
              <span className="text-gradient-holographic">Pricing</span>
            </h2>
            <p className="text-foreground/60 text-sm sm:text-base mt-4 max-w-2xl mx-auto">
              Choose a plan that fits your needs. All plans include a free consultation to scope your project.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
          >
            {service.pricing.map((tier, i) => (
              <motion.div
                key={tier.name}
                className="group"
                variants={fadeUp}
                custom={i}
              >
                <div
                  className={`glass-card p-6 sm:p-8 h-full flex flex-col transition-all duration-300 group-hover:scale-[1.01] ${
                    tier.highlighted ? 'relative' : ''
                  }`}
                  style={
                    tier.highlighted
                      ? {
                          borderColor: `rgba(${accent}, 0.3)`,
                          boxShadow: `0 0 30px rgba(${accent}, 0.08), inset 0 0 20px rgba(${accent}, 0.03)`,
                        }
                      : undefined
                  }
                >
                  {/* Popular badge */}
                  {tier.highlighted && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase"
                      style={{
                        background: `linear-gradient(135deg, rgba(${accent}, 0.9), rgba(${accent}, 0.7))`,
                        color: '#ffffff',
                      }}
                    >
                      Most Popular
                    </div>
                  )}

                  {/* Tier name */}
                  <h3
                    className="font-bold text-lg text-foreground mb-2"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {tier.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <span
                      className="text-3xl sm:text-4xl font-bold"
                      style={{
                        fontFamily: 'var(--font-space-grotesk)',
                        color: tier.highlighted ? accentColor : undefined,
                      }}
                    >
                      {tier.price}
                    </span>
                    {tier.price !== 'Custom' && (
                      <span className="text-muted-foreground text-sm ml-1">
                        {tier.price.includes('/mo') ? '' : tier.price.includes('/yr') ? '' : ''}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm">
                        <Check
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: `rgba(${accent}, 0.8)` }}
                        />
                        <span className="text-foreground/70">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={handleGetQuote}
                    className={`w-full font-semibold ${
                      tier.highlighted
                        ? 'btn-glow text-white'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                    style={
                      tier.highlighted
                        ? { background: `linear-gradient(135deg, rgba(${accent}, 0.9), rgba(${accent}, 0.7))` }
                        : undefined
                    }
                  >
                    Contact Us
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══════════════════════════════════════════════════════════════════
          8. FAQ SECTION
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
          >
            <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-4">
              FAQ
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className="text-foreground">Frequently Asked </span>
              <span className="text-gradient-cyan">Questions</span>
            </h2>
          </motion.div>

          <motion.div
            className="space-y-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
          >
            {service.faq.map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}>
                <FAQItem
                  item={item}
                  accentRgb={accent}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══════════════════════════════════════════════════════════════════
          9. CTA SECTION
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full pointer-events-none opacity-20"
          style={{ background: `radial-gradient(circle, rgba(${accent}, 0.15) 0%, transparent 70%)` }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            className="glass-card p-8 sm:p-12 text-center"
            style={{
              borderColor: `rgba(${accent}, 0.15)`,
              boxShadow: `0 0 40px rgba(${accent}, 0.05)`,
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6 border"
              style={{
                background: `rgba(${accent}, 0.08)`,
                borderColor: `rgba(${accent}, 0.15)`,
              }}
            >
              <Sparkles className="w-7 h-7" style={{ color: accentColor }} />
            </div>

            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className="text-foreground">Ready to Get Started with </span>
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(${accent}, 1), rgba(${accent}, 0.65))`,
                }}
              >
                {service.name}?
              </span>
            </h2>

            <p className="text-foreground/60 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Let our experts discuss your requirements and craft a tailored solution. No commitment, no pressure — just a conversation about how we can help.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                onClick={handleGetQuote}
                size="lg"
                className="btn-glow font-semibold px-8 text-base"
                style={{
                  background: `linear-gradient(135deg, rgba(${accent}, 0.9), rgba(${accent}, 0.7))`,
                  color: '#ffffff',
                }}
              >
                Get a Quote
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-semibold px-8 text-base border-border hover:bg-secondary/50"
                onClick={() => navigate('home')}
              >
                Explore All Services
              </Button>
            </div>

            {/* Contact info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" style={{ color: `rgba(${accent}, 0.7)` }} />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" style={{ color: `rgba(${accent}, 0.7)` }} />
                <span>contact@abwcurious.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" style={{ color: `rgba(${accent}, 0.7)` }} />
                <span>Navi Mumbai, India</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
