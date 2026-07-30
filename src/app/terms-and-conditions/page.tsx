import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function TermsAndConditions() {
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
          Terms and Conditions
        </h1>
        <p className="text-sm text-foreground/60 mb-8">Last updated: March 2025</p>

        <div className="glass-card p-6 sm:p-8 space-y-6 text-foreground/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>1. Agreement to Terms</h2>
            <p>
              These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) and ABWcurious Pvt Ltd (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), governing your access to and use of our website at https://abwcurious.com, our products including CyberIntelligence360, TheCodeArena, StudySpark, and Restaurant360, and all associated services including but not limited to Cybersecurity, Vulnerability Assessment and Penetration Testing (VAPT), Digital Forensics, Web Development, App Development, AI Learning, Digital Marketing, Annual Maintenance Contract (AMC) Services, and IT Support.
            </p>
            <p className="mt-3">
              By accessing or using our website, products, or services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with any part of these Terms, you must discontinue use of our website and services immediately. Your continued use of our services following the posting of any changes to these Terms constitutes acceptance of those changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>2. Definitions</h2>
            <p>
              &quot;Services&quot; refers to all cybersecurity, VAPT, digital forensics, web development, app development, AI learning, digital marketing, AMC, and IT support services provided by ABWcurious Pvt Ltd. &quot;Products&quot; refers to our proprietary software platforms including CyberIntelligence360, TheCodeArena, StudySpark, and Restaurant360. &quot;Content&quot; refers to all text, graphics, images, data, software, and other materials available on our website or through our services. &quot;Confidential Information&quot; refers to any non-public information disclosed by either party during the course of engagement, including security reports, vulnerability findings, and proprietary methodologies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>3. Use of Services</h2>
            <p>
              You agree to use our services only for lawful purposes and in accordance with these Terms. You must not use our services in any way that violates any applicable Indian or international law, including the Information Technology Act, 2000, and its subsequent amendments. You are prohibited from attempting to gain unauthorized access to any portion of our services, other accounts, computer systems, or networks connected to our servers through hacking, password mining, or any other means.
            </p>
            <p className="mt-3">
              For cybersecurity and VAPT services, you affirm that you have proper authorization and ownership of all systems, networks, and applications that you request us to test. You acknowledge that ABWcurious Pvt Ltd will conduct security testing only within the defined scope as agreed upon in the Statement of Work (SOW). Any findings, vulnerabilities, or security issues discovered during the engagement are confidential and shall not be disclosed to third parties without our written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>4. Intellectual Property Rights</h2>
            <p>
              All content, features, functionality, software, and products of ABWcurious Pvt Ltd are and shall remain the exclusive property of ABWcurious Pvt Ltd and its licensors. Our products—including CyberIntelligence360, TheCodeArena, StudySpark, and Restaurant360—are protected by copyright, trademark, patent, trade secret, and other intellectual property laws of India and international treaties. No right, title, or interest in or to any such content, features, or functionality is transferred to you by these Terms.
            </p>
            <p className="mt-3">
              You are granted a limited, non-exclusive, non-transferable, revocable license to access and use our services and products solely for your internal business purposes, subject to these Terms. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our services, except as permitted by these Terms or with our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>5. User Accounts and Responsibilities</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password that you use to access our services and for any activities or actions under your password. You agree not to disclose your password to any third party and to notify us immediately of any unauthorized access to or use of your account. ABWcurious Pvt Ltd shall not be liable for any loss or damage arising from your failure to maintain the security of your account credentials.
            </p>
            <p className="mt-3">
              You must immediately notify us of any unauthorized use of your account or any other breach of security. We reserve the right to suspend or terminate your account if any activity violates these Terms or poses a security risk to our systems, other users, or third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>6. Service Engagement and Deliverables</h2>
            <p>
              All professional services engagements shall be governed by a separate Statement of Work (SOW) or Service Agreement that outlines the specific scope, deliverables, timelines, and fees. Our cybersecurity and VAPT reports are provided for informational purposes and are based on the state of systems at the time of assessment. The absence of identified vulnerabilities does not guarantee that systems are completely secure, as new threats and vulnerabilities may emerge after our assessment.
            </p>
            <p className="mt-3">
              For web and app development projects, you retain ownership of your content and data, while we retain ownership of our pre-existing tools, frameworks, and methodologies. Custom code developed specifically for your project shall be transferred to you upon full payment, subject to the terms of the applicable development agreement. Timelines for deliverables are estimates and may be affected by factors including but not limited to your responsiveness, complexity of requirements, and third-party dependencies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>7. Payment Terms</h2>
            <p>
              Fees for our services and products are as specified in the applicable SOW, invoice, or pricing page. All fees are quoted in Indian Rupees (INR) unless otherwise specified. Payment terms are Net 30 days from the date of invoice unless otherwise agreed in writing. We reserve the right to suspend services for accounts that are overdue. Late payments may incur interest at the rate of 1.5% per month or the maximum rate permitted by applicable law, whichever is lower. All payments are non-refundable except as expressly stated in our Refund Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, ABWcurious Pvt Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses resulting from your use of our services. In no event shall our total liability exceed the amount you have paid us in the twelve (12) months preceding the event giving rise to the claim, or INR 1,00,000 (Indian Rupees One Lakh), whichever is less.
            </p>
            <p className="mt-3">
              We do not warrant that our services will be uninterrupted, timely, secure, or error-free. Our cybersecurity assessments and VAPT services identify vulnerabilities based on known testing methodologies at the time of engagement and do not constitute a guarantee that systems are impenetrable or immune to future attacks.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>9. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless ABWcurious Pvt Ltd and its officers, directors, employees, agents, licensors, and suppliers from and against any claims, actions, demands, liabilities, and settlements including legal fees arising from your violation of these Terms, your use of our services, or your violation of any rights of another party. This indemnification obligation will survive the termination of your relationship with us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>10. Termination</h2>
            <p>
              We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms. Upon termination, your right to use our services will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including but not limited to intellectual property rights, limitation of liability, indemnification, and warranty disclaimers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>11. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising out of or related to these Terms or our services shall be resolved through good-faith negotiation. If negotiation fails, disputes shall be submitted to binding arbitration in accordance with the Arbitration and Conciliation Act, 1996, and the seat of arbitration shall be Navi Mumbai, Maharashtra, India. The language of arbitration shall be English. Subject to the arbitration clause, the courts of Navi Mumbai, Maharashtra shall have exclusive jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>12. Modifications to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will make reasonable efforts to provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our services after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>13. Contact Information</h2>
            <p>
              For any questions or concerns regarding these Terms and Conditions, please contact us:
            </p>
            <div className="mt-3 space-y-1">
              <p><strong className="text-foreground">ABWcurious Pvt Ltd</strong></p>
              <p>Vashi, Navi Mumbai, Maharashtra, India</p>
              <p>Email: <a href="mailto:info@abwcurious.com" className="text-primary hover:underline">info@abwcurious.com</a></p>
              <p>Phone: <a href="tel:+918108915402" className="text-primary hover:underline">+91 8108915402</a></p>
              <p>Website: <a href="https://abwcurious.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://abwcurious.com</a></p>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-primary hover:underline text-sm">Return to ABWcurious.com</a>
        </div>
      </div>
    </div>
  );
}
