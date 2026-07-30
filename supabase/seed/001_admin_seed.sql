-- ============================================================
-- ABWcurious Pvt. Ltd. — Admin Seed Script
-- Seed: 001_admin_seed.sql
-- ============================================================
-- IMPORTANT: Run this only in a secure environment.
-- Never expose seeded credentials in public repositories.
-- Change credentials immediately after first login.
-- ============================================================

-- Seed the default super admin profile.
-- The auth.users record must be created via Supabase Auth API first.
-- This script seeds the profile after the auth user is created.

-- To create the admin auth user, use Supabase Dashboard or CLI:
-- supabase auth create-user --email admin@abwcurious.com --password 'Admin@ABWcurious#2026'

-- Then run this script to set the super_admin role:

-- Update the profile for the admin email to super_admin role
UPDATE public.profiles
SET
  role = 'super_admin',
  full_name = 'ABWcurious Administrator',
  display_name = 'Super Admin',
  is_active = TRUE,
  updated_at = NOW()
WHERE email = 'admin@abwcurious.com';

-- If the profile doesn't exist yet (first run before trigger fires), create it
INSERT INTO public.profiles (id, email, full_name, display_name, role, is_active)
SELECT
  id,
  'admin@abwcurious.com',
  'ABWcurious Administrator',
  'Super Admin',
  'super_admin',
  TRUE
FROM auth.users
WHERE email = 'admin@abwcurious.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  display_name = 'Super Admin',
  is_active = TRUE,
  updated_at = NOW();

-- ============================================================
-- Seed initial products
-- ============================================================

INSERT INTO public.products (slug, name, tagline, description, long_description, category, features, external_url, demo_url, status, featured, sort_order)
VALUES
(
  'restaurant360',
  'Restaurant360',
  'Complete Restaurant Management Platform',
  'A comprehensive SaaS platform for restaurant management, POS, orders, inventory, staff, and analytics.',
  'Restaurant360 is ABWcurious''s flagship hospitality technology product. It provides end-to-end restaurant management capabilities including point-of-sale, online ordering, inventory management, staff scheduling, customer loyalty programs, and advanced business analytics. Built for restaurants of all sizes.',
  'saas',
  '[
    {"title": "Smart POS System", "description": "Fast, intuitive point-of-sale with support for multiple payment methods"},
    {"title": "Online Ordering", "description": "Built-in online ordering with delivery integration"},
    {"title": "Inventory Management", "description": "Real-time inventory tracking and automated reorder alerts"},
    {"title": "Staff Management", "description": "Scheduling, payroll integration, and performance tracking"},
    {"title": "Analytics Dashboard", "description": "Comprehensive business insights and revenue analytics"},
    {"title": "Customer Loyalty", "description": "Reward programs, digital menus, and customer engagement tools"}
  ]',
  'https://restaurant360.abwcurious.com/',
  'https://restaurant360.abwcurious.com/',
  'published',
  TRUE,
  1
),
(
  'intelliqr',
  'IntelliQR',
  'Smart QR Code Management Platform',
  'Dynamic QR code generation and analytics platform for businesses, marketing campaigns, and smart experiences.',
  'IntelliQR is ABWcurious''s intelligent QR code management solution. Create, track, and analyze dynamic QR codes for menus, marketing campaigns, product packaging, events, and more. Features real-time analytics, A/B testing, and seamless integrations.',
  'saas',
  '[
    {"title": "Dynamic QR Codes", "description": "Update QR content without reprinting — always current"},
    {"title": "Advanced Analytics", "description": "Track scans, locations, devices, and conversion metrics"},
    {"title": "Bulk Generation", "description": "Generate thousands of unique QR codes in seconds"},
    {"title": "Custom Branding", "description": "Branded QR codes with logo, colors, and custom frames"},
    {"title": "API Access", "description": "Full REST API for programmatic QR code management"},
    {"title": "Integrations", "description": "Connect with your existing marketing and CRM tools"}
  ]',
  'https://intelliqr.abwcurious.com/',
  'https://intelliqr.abwcurious.com/',
  'published',
  TRUE,
  2
),
(
  'cyberintelligence360',
  'CyberIntelligence360',
  'AI-Powered Threat Intelligence Platform',
  'Real-time cybersecurity threat intelligence, vulnerability management, and security operations platform.',
  'CyberIntelligence360 is ABWcurious''s enterprise cybersecurity platform. It combines AI-driven threat intelligence, vulnerability scanning, SOC automation, and compliance management into a unified security operations platform.',
  'cybersecurity',
  '[
    {"title": "Threat Intelligence", "description": "Real-time threat feeds and AI-powered threat correlation"},
    {"title": "Vulnerability Management", "description": "Continuous scanning and risk prioritization"},
    {"title": "SOC Automation", "description": "Automated incident response and playbooks"},
    {"title": "Compliance Dashboard", "description": "ISO 27001, SOC2, GDPR, HIPAA compliance tracking"},
    {"title": "Dark Web Monitoring", "description": "Monitor for leaked credentials and brand mentions"},
    {"title": "Security Scoring", "description": "Real-time security posture scoring and benchmarking"}
  ]',
  NULL,
  NULL,
  'published',
  TRUE,
  3
),
(
  'studyspark',
  'StudySpark',
  'AI-Powered Learning Management System',
  'Next-generation e-learning platform with AI tutoring, adaptive learning paths, and comprehensive analytics.',
  'StudySpark is ABWcurious''s education technology platform. It leverages AI to create personalized learning experiences, adaptive curricula, and intelligent tutoring systems for students and organizations.',
  'edtech',
  '[
    {"title": "AI Tutor", "description": "24/7 AI-powered tutoring with personalized explanations"},
    {"title": "Adaptive Learning", "description": "Paths that adapt to individual student progress"},
    {"title": "Live Classes", "description": "Interactive video sessions with recording and transcription"},
    {"title": "Assessment Engine", "description": "AI-generated quizzes, assignments, and proctored exams"},
    {"title": "Analytics", "description": "Detailed learner progress and engagement analytics"},
    {"title": "Certifications", "description": "Blockchain-verified certificates and credentials"}
  ]',
  NULL,
  NULL,
  'published',
  FALSE,
  4
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Seed initial services
-- ============================================================

INSERT INTO public.services (slug, name, tagline, description, category, icon, status, featured, sort_order)
VALUES
('software-development', 'Software Development', 'Custom software built for scale', 'End-to-end software development from concept to deployment', 'development', 'Code2', 'published', TRUE, 1),
('website-development', 'Website Development', 'Stunning, high-performance websites', 'Custom website design and development with modern tech stacks', 'development', 'Globe', 'published', TRUE, 2),
('mobile-apps', 'Mobile App Development', 'Native & cross-platform mobile apps', 'iOS, Android, and cross-platform mobile application development', 'development', 'Smartphone', 'published', TRUE, 3),
('cloud-solutions', 'Cloud Solutions', 'Scalable cloud infrastructure', 'Cloud architecture, migration, and managed services', 'cloud', 'Cloud', 'published', TRUE, 4),
('digital-marketing', 'Digital Marketing', 'Data-driven growth strategies', 'SEO, SEM, social media, and performance marketing services', 'marketing', 'TrendingUp', 'published', FALSE, 5),
('devops', 'DevOps & CI/CD', 'Automate. Deploy. Scale.', 'DevOps implementation, pipeline automation, and infrastructure as code', 'devops', 'GitBranch', 'published', FALSE, 6),
('it-consulting', 'IT Consulting', 'Strategic technology advisory', 'Enterprise IT strategy, architecture review, and digital transformation consulting', 'consulting', 'Briefcase', 'published', FALSE, 7),
('ui-ux-design', 'UI/UX Design', 'Experiences that delight users', 'User research, interface design, and design system creation', 'design', 'Palette', 'published', TRUE, 8),
('maintenance-support', 'Maintenance & Support', 'Keep your systems running flawlessly', 'Ongoing maintenance, monitoring, and technical support services', 'support', 'Wrench', 'published', FALSE, 9),
('automation', 'Process Automation', 'Automate your workflows', 'Business process automation, RPA, and workflow optimization', 'automation', 'Zap', 'published', FALSE, 10),
('ai-solutions', 'AI Solutions', 'Intelligent systems for every challenge', 'Custom AI/ML solutions, LLM integration, and intelligent automation', 'ai', 'Brain', 'published', TRUE, 11),
('machine-learning', 'Machine Learning', 'Data-driven predictions and insights', 'ML model development, training, deployment, and MLOps', 'ai', 'Activity', 'published', FALSE, 12),
('iot', 'IoT Solutions', 'Connect everything', 'IoT device management, edge computing, and connected systems', 'iot', 'Wifi', 'published', FALSE, 13),
('embedded-systems', 'Embedded Systems', 'Hardware meets software', 'Embedded software development, firmware, and hardware integration', 'embedded', 'Cpu', 'published', FALSE, 14)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Seed initial audit log entry
-- ============================================================

INSERT INTO public.audit_logs (action, table_name, metadata)
VALUES ('system_seed', 'system', '{"message": "Database seeded successfully", "version": "001"}');
