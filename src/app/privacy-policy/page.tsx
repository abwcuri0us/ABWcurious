import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>

        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.svg" alt="ABWcurious Logo" width={40} height={40} className="h-10 w-10 object-contain" unoptimized />
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            <span className="text-gradient-cyan">ABW</span>
            <span className="text-foreground">curious</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Privacy Policy
        </h1>
        <p className="text-sm text-foreground/60 mb-8">Last updated: March 2025</p>

        <div className="glass-card p-6 sm:p-8 space-y-6 text-foreground/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>1. Introduction</h2>
            <p>
              ABWcurious Pvt Ltd (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting the privacy and security of your personal information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit our website at https://abwcurious.com, use our products (CyberIntelligence360, TheCodeArena, StudySpark, Restaurant360), or engage our services including Cybersecurity, VAPT, Digital Forensics, Web Development, App Development, AI Learning, Digital Marketing, AMC Services, and IT Support.
            </p>
            <p className="mt-3">
              This Privacy Policy is designed in compliance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;). As a cybersecurity company, we hold ourselves to the highest standards of data protection and security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>2. Information We Collect</h2>
            <p className="font-medium text-foreground mb-2">2.1 Personal Information You Provide:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Full name, email address, phone number, and company name when you contact us or create an account</li>
              <li>Billing and payment information including address and GST details for invoicing purposes</li>
              <li>Project requirements, system information, and access credentials provided during service engagements</li>
              <li>Communication records including emails, support tickets, and meeting notes</li>
              <li>Educational and professional details when you enroll in AI Learning programs or use StudySpark</li>
            </ul>
            <p className="font-medium text-foreground mb-2 mt-4">2.2 Information Collected Automatically:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>IP address, browser type, operating system, and device identifiers</li>
              <li>Pages visited, time spent on pages, click patterns, and navigation paths</li>
              <li>Referral source, search terms used to find our website</li>
              <li>Geolocation data (country and city level) based on IP address</li>
              <li>Cookies and similar tracking technologies as described in our Cookie Policy</li>
            </ul>
            <p className="font-medium text-foreground mb-2 mt-4">2.3 Information from Service Engagements:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Security scan results, vulnerability reports, and forensic analysis data collected during VAPT and digital forensics engagements</li>
              <li>System configurations, network topologies, and access logs provided for cybersecurity assessments</li>
              <li>Source code repositories and development artifacts shared during web and app development projects</li>
              <li>Marketing campaign data, analytics, and performance metrics from digital marketing engagements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Service Delivery:</strong> To provide, maintain, and improve our cybersecurity, development, and consulting services, including generating VAPT reports, forensic analysis, and development deliverables</li>
              <li><strong className="text-foreground">Communication:</strong> To respond to your inquiries, send service-related notifications, schedule meetings, and provide technical support</li>
              <li><strong className="text-foreground">Account Management:</strong> To create and manage your accounts on our platforms including CyberIntelligence360, TheCodeArena, StudySpark, and Restaurant360</li>
              <li><strong className="text-foreground">Product Improvement:</strong> To analyze usage patterns, identify bugs, and improve the functionality and security of our products and services</li>
              <li><strong className="text-foreground">Security:</strong> To detect, prevent, and address security incidents, fraud, and other potentially prohibited or illegal activities</li>
              <li><strong className="text-foreground">Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, or enforceable governmental requests</li>
              <li><strong className="text-foreground">Marketing:</strong> To send you promotional communications about our services, products, and events, only with your prior consent</li>
              <li><strong className="text-foreground">Analytics:</strong> To generate aggregated, anonymized analytics to understand service usage trends and improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>4. Data Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Service Providers:</strong> With trusted third-party vendors who perform services on our behalf, such as cloud hosting (AWS, Azure), payment processing, email delivery, and analytics. All service providers are bound by contractual obligations to maintain the confidentiality and security of your data.</li>
              <li><strong className="text-foreground">Legal Requirements:</strong> When required by law, court order, or governmental regulation, including responses to lawful requests from Indian law enforcement agencies under the IT Act, 2000 and the DPDP Act, 2023</li>
              <li><strong className="text-foreground">Business Transfers:</strong> In connection with any merger, acquisition, reorganization, or sale of all or a portion of our assets, your personal information may be transferred as part of such transaction</li>
              <li><strong className="text-foreground">With Your Consent:</strong> When you have explicitly consented to sharing your information with specific third parties</li>
              <li><strong className="text-foreground">VAPT Engagements:</strong> Vulnerability and security findings may be shared with your designated security team and authorized stakeholders as defined in the SOW</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>5. Data Security</h2>
            <p>
              As a cybersecurity company, we implement industry-leading security measures to protect your personal information. These include:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li>End-to-end encryption for data in transit using TLS 1.3 and at rest using AES-256 encryption</li>
              <li>Multi-factor authentication (MFA) for all internal systems and administrative access</li>
              <li>Regular security audits, penetration testing, and vulnerability assessments of our own infrastructure</li>
              <li>Role-based access controls ensuring that only authorized personnel can access personal data</li>
              <li>Secure data centers with SOC 2 Type II compliance through our cloud infrastructure providers</li>
              <li>Incident response procedures and breach notification protocols aligned with the DPDP Act, 2023</li>
              <li>Regular employee security awareness training and background verification checks</li>
            </ul>
            <p className="mt-3">
              While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to maintaining the highest practicable security standards.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>6. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, including satisfying legal, accounting, or reporting requirements. Specific retention periods include:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Account Data:</strong> Retained for the duration of your active account plus 2 years after deactivation</li>
              <li><strong className="text-foreground">Service Engagement Data:</strong> VAPT reports and forensic findings are retained for 5 years from the date of delivery, as required by industry standards and legal obligations</li>
              <li><strong className="text-foreground">Financial Records:</strong> Invoices and payment records are retained for 7 years as required by Indian tax laws and the Companies Act, 2013</li>
              <li><strong className="text-foreground">Marketing Communications:</strong> Email consent records are retained for 3 years from the date of consent withdrawal</li>
              <li><strong className="text-foreground">Website Analytics:</strong> Anonymized analytics data may be retained indefinitely for trend analysis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>7. Your Rights Under the DPDP Act, 2023</h2>
            <p>
              As a Data Principal under the Digital Personal Data Protection Act, 2023, you have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Right to Access:</strong> You can request a copy of the personal data we hold about you</li>
              <li><strong className="text-foreground">Right to Correction:</strong> You can request correction of inaccurate or incomplete personal data</li>
              <li><strong className="text-foreground">Right to Erasure:</strong> You can request deletion of your personal data, subject to legal retention requirements</li>
              <li><strong className="text-foreground">Right to Nominate:</strong> You can nominate another individual to exercise your rights in the event of your death or incapacity</li>
              <li><strong className="text-foreground">Right to Grievance Redressal:</strong> You can lodge a complaint with our Grievance Officer if you believe your data rights have been violated</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact our Grievance Officer at the details provided below. We will respond to your request within 30 days as required by the DPDP Act, 2023.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>8. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have inadvertently collected personal data from a child under 18, we will take immediate steps to delete such information from our servers. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than India, particularly when we use cloud infrastructure providers with global data centers. We ensure that such transfers comply with the DPDP Act, 2023, and that appropriate safeguards are in place, including Standard Contractual Clauses and adequacy decisions. By using our services, you consent to the transfer of your information to these countries.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. For significant changes affecting your rights, we will provide additional notice through email or a prominent notice on our website. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>11. Grievance Officer Contact Information</h2>
            <p>
              In accordance with the Information Technology Act, 2000 and the DPDP Act, 2023, we have appointed a Grievance Officer to address any concerns regarding this Privacy Policy or our data handling practices:
            </p>
            <div className="mt-3 space-y-1">
              <p><strong className="text-foreground">Grievance Officer, ABWcurious Pvt Ltd</strong></p>
              <p>Vashi, Navi Mumbai, Maharashtra, India</p>
              <p>Email: <a href="mailto:info@abwcurious.com" className="text-primary hover:underline">info@abwcurious.com</a></p>
              <p>Phone: <a href="tel:+918108915402" className="text-primary hover:underline">+91 8108915402</a></p>
              <p>Website: <a href="https://abwcurious.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://abwcurious.com</a></p>
            </div>
            <p className="mt-3">
              We will acknowledge receipt of your complaint within 48 hours and resolve it within 30 days of receipt, in accordance with applicable law.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-primary hover:underline text-sm">Return to ABWcurious.com</a>
        </div>
      </div>
    </div>
  );
}
