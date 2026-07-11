import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function RefundPolicy() {
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
          Refund Policy
        </h1>
        <p className="text-sm text-foreground/60 mb-8">Last updated: March 2025</p>

        <div className="glass-card p-6 sm:p-8 space-y-6 text-foreground/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>1. Overview</h2>
            <p>
              ABWcurious Pvt Ltd (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to ensuring client satisfaction across all our services and products. This Refund Policy outlines the circumstances under which refunds may be issued for our cybersecurity, VAPT, digital forensics, web development, app development, AI Learning, digital marketing, AMC services, and IT support, as well as our products including CyberIntelligence360, TheCodeArena, StudySpark, and Restaurant360.
            </p>
            <p className="mt-3">
              This policy is designed in compliance with the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020. We encourage you to read this policy carefully before engaging our services or purchasing our products. By making a payment, you acknowledge and agree to this Refund Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>2. Professional Services Refund Policy</h2>
            <p className="font-medium text-foreground mb-2">2.1 Cybersecurity and VAPT Services</p>
            <p>
              Cybersecurity and VAPT engagements are professional services that require significant resource allocation, including dedicated security researchers, specialized tools, and time commitments. Due to the nature of these services:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Before engagement commencement:</strong> If you cancel the engagement before work has commenced, a full refund of any advance payment will be issued within 15 business days, minus a 5% processing fee to cover administrative costs</li>
              <li><strong className="text-foreground">After engagement commencement:</strong> Once our security team has begun the assessment, refunds are not available for completed work. Partial refunds may be considered for the unexecuted portion of the engagement on a pro-rata basis, subject to mutual agreement</li>
              <li><strong className="text-foreground">Deliverable disputes:</strong> If you believe the deliverables do not meet the scope defined in the Statement of Work (SOW), you may raise a dispute within 15 business days of delivery. We will review the deliverables against the SOW and, if the dispute is valid, we will either revise the deliverables at no additional cost or issue a partial refund for the deficient portion</li>
              <li><strong className="text-foreground">Scope changes:</strong> Refunds are not applicable if the client changes the scope of the engagement after work has commenced, resulting in a modified deliverable set</li>
            </ul>

            <p className="font-medium text-foreground mb-2 mt-4">2.2 Digital Forensics Services</p>
            <p>
              Digital forensics engagements involve time-sensitive evidence preservation and analysis. Due to the nature of forensic work:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li>No refunds are available for forensic services once evidence collection and analysis has commenced, as the resources and time committed cannot be recovered</li>
              <li>If the engagement is cancelled before evidence collection begins, a refund will be issued for the advance payment minus a 10% administrative fee</li>
              <li>If forensic analysis is unable to yield meaningful results due to factors beyond our control (e.g., evidence has been tampered with, insufficient log retention), refunds are not applicable as the professional effort has been expended</li>
            </ul>

            <p className="font-medium text-foreground mb-2 mt-4">2.3 Web and App Development Services</p>
            <p>
              Development projects typically follow a milestone-based payment structure. Refund terms for development services are as follows:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Before project kickoff:</strong> Full refund of any advance payment, minus a 5% processing fee, if cancellation is requested before development work begins</li>
              <li><strong className="text-foreground">During development:</strong> Refunds are calculated on a pro-rata basis for uncompleted milestones. Completed milestones that have been approved by the client are non-refundable</li>
              <li><strong className="text-foreground">After delivery:</strong> Post-delivery refund requests will be evaluated based on the warranty terms specified in the development agreement. Bug fixes and maintenance within the warranty period are provided at no additional cost</li>
              <li><strong className="text-foreground">Client-initiated termination:</strong> If the client terminates the project before completion, payment for completed work is due in full, and any advance for uncompleted work will be refunded on a pro-rata basis after deducting costs incurred</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>3. Product Subscription Refund Policy</h2>
            <p className="font-medium text-foreground mb-2">3.1 CyberIntelligence360</p>
            <p>
              CyberIntelligence360 is offered as a subscription-based threat intelligence and security monitoring platform:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Annual subscriptions:</strong> A full refund is available within 14 calendar days from the date of purchase if you are not satisfied with the platform. After 14 days, a pro-rata refund may be issued for the remaining unused period of the subscription, subject to a 15% early termination fee</li>
              <li><strong className="text-foreground">Monthly subscriptions:</strong> No refunds for the current billing month. You may cancel at any time, and the cancellation will take effect at the end of the current billing period</li>
              <li><strong className="text-foreground">Enterprise plans:</strong> Refund terms are governed by the specific Enterprise Service Level Agreement (SLA) executed between ABWcurious Pvt Ltd and the enterprise client</li>
              <li><strong className="text-foreground">Free trials:</strong> No payment is required during the free trial period, and therefore no refund is applicable</li>
            </ul>

            <p className="font-medium text-foreground mb-2 mt-4">3.2 TheCodeArena</p>
            <p>
              TheCodeArena offers coding challenges and skill development features:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Premium subscriptions:</strong> A full refund within 7 calendar days of purchase if you have not extensively used premium features (defined as accessing more than 3 premium challenges or resources). After 7 days, subscriptions are non-refundable</li>
              <li><strong className="text-foreground">Contest entry fees:</strong> Entry fees for competitive coding contests are non-refundable once the contest has commenced. If a contest is cancelled by ABWcurious Pvt Ltd, a full refund of the entry fee will be issued</li>
            </ul>

            <p className="font-medium text-foreground mb-2 mt-4">3.3 StudySpark</p>
            <p>
              StudySpark provides AI-powered learning and educational content:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Course purchases:</strong> Full refund within 14 calendar days of purchase if you have completed less than 25% of the course content. No refund is available after completing 25% or more of the course material</li>
              <li><strong className="text-foreground">Subscription plans:</strong> Full refund within 7 days of the initial purchase. Subsequent renewals are non-refundable but may be cancelled to prevent future billing</li>
              <li><strong className="text-foreground">AI credits/packages:</strong> Unused AI credits are non-refundable but remain available in your account for 12 months from the date of purchase</li>
            </ul>

            <p className="font-medium text-foreground mb-2 mt-4">3.4 Restaurant360</p>
            <p>
              Restaurant360 is currently in development (&quot;coming soon&quot;). Refund terms for this product will be published upon official launch. If you have enrolled in an early access or pre-order program:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li>Full refund is available at any time before the product launch date</li>
              <li>Post-launch refund terms will be communicated via email to all pre-order customers prior to launch</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>4. AMC and IT Support Refund Policy</h2>
            <p>
              Annual Maintenance Contract (AMC) and IT Support services are provided on a retainer basis:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">AMC contracts:</strong> A pro-rata refund for the remaining contract period may be issued if you wish to terminate the AMC early, subject to a 20% early termination fee and deduction for services already rendered</li>
              <li><strong className="text-foreground">Monthly IT support retainers:</strong> No refunds for the current month. Cancellation takes effect at the end of the current billing period</li>
              <li><strong className="text-foreground">Ad-hoc IT support:</strong> No refunds for completed support sessions. If a support session does not resolve the reported issue, a follow-up session will be provided at no additional cost</li>
              <li><strong className="text-foreground">Service level disputes:</strong> If we fail to meet the response time or resolution commitments defined in the AMC SLA, service credits will be applied to your account as per the SLA terms, in lieu of cash refunds</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>5. Digital Marketing Services Refund Policy</h2>
            <p>
              Digital marketing services involve ongoing campaign management and optimization:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Setup fees:</strong> Non-refundable once campaign setup and strategy development has been completed</li>
              <li><strong className="text-foreground">Monthly management fees:</strong> No refunds for the current billing month. Cancellation will take effect from the next billing period</li>
              <li><strong className="text-foreground">Ad spend:</strong> Advertising spend on third-party platforms (Google Ads, Meta Ads, LinkedIn Ads, etc.) is paid directly to those platforms and is governed by their respective refund policies. ABWcurious Pvt Ltd does not control or refund third-party ad spend</li>
              <li><strong className="text-foreground">Campaign performance:</strong> As noted in our Disclaimer, we do not guarantee specific marketing outcomes. Refunds are not available based on campaign performance metrics alone</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>6. Refund Request Process</h2>
            <p>To request a refund, please follow these steps:</p>
            <ol className="list-decimal list-inside space-y-2 ml-2 mt-2">
              <li><strong className="text-foreground">Submit a request:</strong> Send an email to <a href="mailto:info@abwcurious.com" className="text-primary hover:underline">info@abwcurious.com</a> with the subject line &quot;Refund Request — [Your Company/Name]&quot; including your invoice number, service details, and reason for the refund request</li>
              <li><strong className="text-foreground">Review period:</strong> Our team will review your request within 5 business days and may reach out for additional information</li>
              <li><strong className="text-foreground">Decision:</strong> You will receive a written decision on your refund request within 10 business days of submission</li>
              <li><strong className="text-foreground">Processing:</strong> Approved refunds will be processed within 15 business days from the date of approval. Refunds will be issued using the original payment method unless otherwise agreed</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>7. Refund Methods</h2>
            <p>
              Refunds will be issued through the following methods:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Original Payment Method:</strong> Refunds will be credited back to the original payment method (credit card, debit card, UPI, bank transfer) used for the purchase</li>
              <li><strong className="text-foreground">Bank Transfer:</strong> If the original payment method is no longer available, a refund will be issued via NEFT/RTGS bank transfer to an account designated by you</li>
              <li><strong className="text-foreground">Service Credits:</strong> In certain cases, we may offer service credits as an alternative to cash refunds, subject to your acceptance. Service credits can be applied toward future services or product subscriptions</li>
            </ul>
            <p className="mt-3">
              Please note that banking processing times may vary. Credit card refunds may take 5-10 business days to appear on your statement, while bank transfers typically take 3-5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>8. Non-Refundable Items</h2>
            <p>The following are explicitly non-refundable:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li>Services that have been fully delivered and accepted by the client</li>
              <li>Consulting fees for completed advisory sessions or strategy workshops</li>
              <li>Custom reports and assessments that have been delivered and reviewed</li>
              <li>Training sessions or workshops that have been conducted</li>
              <li>Third-party licensing fees, domain registrations, and hosting charges passed through at cost</li>
              <li>Late payment fees or penalty charges</li>
              <li>Services rendered under a fixed-price contract where deliverables have been completed per the SOW</li>
              <li>Expired or unused AI credits past the 12-month validity period on StudySpark</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>9. Dispute Resolution</h2>
            <p>
              If you disagree with our refund decision, you may escalate the matter as follows:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Internal escalation:</strong> Request a review by our senior management team by emailing <a href="mailto:info@abwcurious.com" className="text-primary hover:underline">info@abwcurious.com</a> with &quot;Refund Escalation&quot; in the subject line</li>
              <li><strong className="text-foreground">Consumer forum:</strong> You have the right to approach the Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019</li>
              <li><strong className="text-foreground">Arbitration:</strong> As per our Terms and Conditions, unresolved disputes may be referred to binding arbitration in Navi Mumbai, Maharashtra, India</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>10. Changes to This Refund Policy</h2>
            <p>
              We reserve the right to update or modify this Refund Policy at any time. Any changes will be posted on this page with an updated &quot;Last updated&quot; date. Changes to this policy will not affect refund requests that have already been submitted. We encourage you to review this policy periodically to stay informed of any updates.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>11. Contact Us</h2>
            <p>
              For refund requests or any questions about this Refund Policy, please contact us:
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
