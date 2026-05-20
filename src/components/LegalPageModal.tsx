'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUp, ChevronRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export type LegalPageType = 'terms' | 'privacy' | 'cookies' | 'disclaimer' | 'refund';

interface LegalPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: LegalPageType;
}

/* ------------------------------------------------------------------ */
/*  Legal Content Data                                                 */
/* ------------------------------------------------------------------ */

const COMPANY = 'ABWcurious Pvt. Ltd.';
const ADDRESS = 'Vashi, Navi Mumbai, Maharashtra, India';
const EMAIL = 'info@abwcurious.com';
const EFFECTIVE_DATE = '2023';

interface LegalContent {
  title: string;
  effectiveDate: string;
  sections: {
    id: string;
    title: string;
    content: React.ReactNode;
  }[];
}

function getLegalContent(type: LegalPageType): LegalContent {
  switch (type) {
    case 'terms':
      return {
        title: 'Terms & Conditions',
        effectiveDate: EFFECTIVE_DATE,
        sections: [
          {
            id: 'acceptance',
            title: '1. Acceptance of Terms',
            content: (
              <>
                <p>
                  By accessing or using the services provided by {COMPANY} (&quot;Company,&quot; &quot;we,&quot;
                  &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms and Conditions
                  (&quot;Terms&quot;). If you do not agree to these Terms, you must not use our services.
                  These Terms constitute a legally binding agreement between you and {COMPANY}.
                </p>
                <p>
                  Your continued use of our services following the posting of any changes to these Terms
                  constitutes acceptance of those changes. We reserve the right to modify, update, or
                  replace any part of these Terms at our sole discretion.
                </p>
              </>
            ),
          },
          {
            id: 'services',
            title: '2. Services Description',
            content: (
              <>
                <p>
                  {COMPANY} provides a range of technology services including, but not limited to,
                  cybersecurity consulting, vulnerability assessment and penetration testing (VAPT),
                  digital forensics, web and mobile application development, artificial intelligence
                  and machine learning solutions, annual maintenance contracts (AMC), and educational
                  programs in the fields of cybersecurity and AI.
                </p>
                <p>
                  We reserve the right to modify, suspend, or discontinue any service at any time
                  without prior notice. We shall not be liable to you or any third party for any
                  modification, suspension, or discontinuance of our services.
                </p>
                <p>
                  The specifics of the services to be provided, including scope, deliverables,
                  timelines, and fees, shall be governed by separate service agreements or statements
                  of work executed between the parties.
                </p>
              </>
            ),
          },
          {
            id: 'accounts',
            title: '3. User Accounts',
            content: (
              <>
                <p>
                  To access certain features of our services, you may be required to create a user
                  account. You are responsible for maintaining the confidentiality of your account
                  credentials and for all activities that occur under your account.
                </p>
                <p>You agree to:</p>
                <ul>
                  <li>Provide accurate, current, and complete information during registration;</li>
                  <li>Maintain and promptly update your account information;</li>
                  <li>Maintain the security of your password and accept all risks of unauthorized access;</li>
                  <li>Immediately notify us of any unauthorized use of your account;</li>
                  <li>Not create accounts using automated means or under false pretenses.</li>
                </ul>
                <p>
                  We reserve the right to suspend or terminate your account if any information provided
                  proves to be inaccurate, not current, or incomplete, or if we have reasonable grounds
                  to suspect fraud, abuse, or violation of these Terms.
                </p>
              </>
            ),
          },
          {
            id: 'ip',
            title: '4. Intellectual Property',
            content: (
              <>
                <p>
                  All content, materials, software, and intellectual property provided as part of our
                  services, including but not limited to text, graphics, logos, icons, images, audio
                  clips, digital downloads, data compilations, and software, are the property of{' '}
                  {COMPANY} or its licensors and are protected by Indian and international copyright,
                  trademark, patent, and other intellectual property laws.
                </p>
                <p>
                  No part of our services or materials may be reproduced, distributed, transmitted,
                  displayed, published, broadcast, or modified without the prior written consent of{' '}
                  {COMPANY}, except as expressly permitted by these Terms or applicable law.
                </p>
                <p>
                  Any reports, assessments, or deliverables created as part of our consulting services
                  remain the intellectual property of {COMPANY} unless expressly transferred in a
                  separate written agreement. Clients receive a limited, non-exclusive license to use
                  such deliverables for their internal business purposes.
                </p>
              </>
            ),
          },
          {
            id: 'liability',
            title: '5. Limitation of Liability',
            content: (
              <>
                <p>
                  To the maximum extent permitted by applicable law, {COMPANY} and its directors,
                  employees, partners, agents, suppliers, and affiliates shall not be liable for any
                  indirect, incidental, special, consequential, or punitive damages, including but not
                  limited to loss of profits, data, use, goodwill, or other intangible losses,
                  resulting from:
                </p>
                <ul>
                  <li>Your access to or use of (or inability to access or use) our services;</li>
                  <li>Any conduct or content of any third party on our services;</li>
                  <li>Any content obtained from our services;</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
                </ul>
                <p>
                  In no event shall our total liability to you for all claims arising out of or
                  relating to the use of our services exceed the amount paid by you to {COMPANY}{' '}
                  during the twelve (12) months preceding the event giving rise to the liability,
                  or INR 10,000 (Indian Rupees Ten Thousand), whichever is greater.
                </p>
              </>
            ),
          },
          {
            id: 'indemnification',
            title: '6. Indemnification',
            content: (
              <>
                <p>
                  You agree to defend, indemnify, and hold harmless {COMPANY} and its directors,
                  employees, partners, agents, suppliers, and affiliates from and against any claims,
                  actions, demands, liabilities, and settlements including legal fees, arising from:
                </p>
                <ul>
                  <li>Your use of our services;</li>
                  <li>Your violation of these Terms;</li>
                  <li>Your violation of any applicable law or regulation;</li>
                  <li>Your violation of any rights of a third party, including intellectual property
                    rights;</li>
                  <li>Any content you submit, post, or transmit through our services.</li>
                </ul>
                <p>
                  {COMPANY} reserves the right to assume exclusive defense and control of any matter
                  subject to indemnification by you, and you shall not settle any such matter without
                  our prior written consent.
                </p>
              </>
            ),
          },
          {
            id: 'governing-law',
            title: '7. Governing Law',
            content: (
              <>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the
                  Republic of India, without regard to its conflict of law provisions. The courts of
                  Navi Mumbai, Maharashtra, India shall have exclusive jurisdiction over any disputes
                  arising out of or relating to these Terms.
                </p>
                <p>
                  For any disputes arising from international transactions or clients based outside
                  India, the parties agree to attempt good-faith negotiation first, and if
                  unsuccessful, the dispute shall be resolved in the courts of Navi Mumbai,
                  Maharashtra, India.
                </p>
              </>
            ),
          },
          {
            id: 'dispute',
            title: '8. Dispute Resolution',
            content: (
              <>
                <p>
                  Any dispute, controversy, or claim arising out of or relating to these Terms, or the
                  breach, termination, or invalidity thereof, shall be resolved through the following
                  process:
                </p>
                <ol>
                  <li>
                    <strong>Negotiation:</strong> The parties shall first attempt to resolve the dispute
                    through good-faith negotiation. Either party may initiate the negotiation process by
                    providing written notice to the other party.
                  </li>
                  <li>
                    <strong>Mediation:</strong> If the dispute is not resolved within thirty (30) days
                    of the initiation of negotiation, either party may submit the dispute to mediation
                    under the rules of the Indian Council of Arbitration.
                  </li>
                  <li>
                    <strong>Arbitration:</strong> If mediation fails, the dispute shall be finally
                    resolved by binding arbitration administered under the Arbitration and Conciliation
                    Act, 1996. The arbitration shall be conducted in English in Navi Mumbai,
                    Maharashtra, India.
                  </li>
                </ol>
              </>
            ),
          },
          {
            id: 'modifications',
            title: '9. Modifications to Terms',
            content: (
              <>
                <p>
                  We reserve the right to modify or replace these Terms at any time at our sole
                  discretion. If a revision is material, we will provide at least thirty (30) days&apos;
                  notice prior to any new terms taking effect. What constitutes a material change will
                  be determined at our sole discretion.
                </p>
                <p>
                  We will notify you of significant changes by posting the new Terms on our website and
                  updating the &quot;Last Updated&quot; date. Your continued use of our services after the
                  effective date of any changes constitutes your acceptance of the revised Terms.
                </p>
                <p>
                  It is your responsibility to review these Terms periodically. We recommend bookmarking
                  this page for your reference.
                </p>
              </>
            ),
          },
          {
            id: 'contact',
            title: '10. Contact Information',
            content: (
              <>
                <p>
                  For any questions, concerns, or requests regarding these Terms and Conditions, please
                  contact us:
                </p>
                <ul>
                  <li>
                    <strong>Company:</strong> {COMPANY}
                  </li>
                  <li>
                    <strong>Address:</strong> {ADDRESS}
                  </li>
                  <li>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                      {EMAIL}
                    </a>
                  </li>
                </ul>
              </>
            ),
          },
        ],
      };

    case 'privacy':
      return {
        title: 'Privacy Policy',
        effectiveDate: EFFECTIVE_DATE,
        sections: [
          {
            id: 'info-collect',
            title: '1. Information We Collect',
            content: (
              <>
                <p>
                  {COMPANY} is committed to protecting your privacy. This Privacy Policy explains how
                  we collect, use, disclose, and safeguard your information when you visit our website,
                  use our services, or interact with us. We collect the following categories of
                  information:
                </p>
                <p>
                  <strong>Personal Information:</strong> Name, email address, phone number, postal
                  address, country, city, and other contact details that you voluntarily provide when
                  registering an account, subscribing to our newsletter, or contacting us.
                </p>
                <p>
                  <strong>Professional Information:</strong> Job title, company name, industry, and
                  other professional details you provide when engaging our services or attending our
                  events.
                </p>
                <p>
                  <strong>Technical Information:</strong> IP address, browser type, operating system,
                  device identifiers, and access times automatically collected when you use our
                  services.
                </p>
                <p>
                  <strong>Usage Data:</strong> Pages visited, features used, time spent on pages,
                  click patterns, and other analytical data about how you interact with our services.
                </p>
                <p>
                  <strong>Cookies and Tracking Data:</strong> We use cookies, web beacons, and similar
                  tracking technologies. Please refer to our Cookie Policy for detailed information.
                </p>
              </>
            ),
          },
          {
            id: 'how-we-use',
            title: '2. How We Use Information',
            content: (
              <>
                <p>We use the information we collect for the following purposes:</p>
                <ul>
                  <li>To provide, operate, and maintain our services;</li>
                  <li>To improve, personalize, and expand our services;</li>
                  <li>To understand and analyze how you use our services;</li>
                  <li>To develop new products, services, features, and functionality;</li>
                  <li>To communicate with you, including customer service and support;</li>
                  <li>To send you updates, marketing communications, and promotional materials
                    (with your consent where required);</li>
                  <li>To detect and prevent fraud, unauthorized access, and other illegal activities;</li>
                  <li>To comply with legal obligations and protect our rights;</li>
                  <li>To facilitate contests, promotions, and surveys;</li>
                  <li>To provide cybersecurity assessments and deliver professional services.</li>
                </ul>
              </>
            ),
          },
          {
            id: 'info-sharing',
            title: '3. Information Sharing',
            content: (
              <>
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may
                  share your information only in the following circumstances:
                </p>
                <ul>
                  <li>
                    <strong>Service Providers:</strong> With third-party vendors who perform services on
                    our behalf, such as hosting, analytics, email delivery, and payment processing.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> If required by law, regulation, or legal
                    process, or if we believe disclosure is necessary to protect our rights, your
                    safety, or the safety of others.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with a merger, acquisition, or
                    sale of assets, your information may be transferred as part of that transaction.
                  </li>
                  <li>
                    <strong>With Your Consent:</strong> When you have given us explicit consent to share
                    your information for a specific purpose.
                  </li>
                  <li>
                    <strong>Aggregated Data:</strong> We may share aggregated, non-personally
                    identifiable information for any purpose.
                  </li>
                </ul>
              </>
            ),
          },
          {
            id: 'data-security',
            title: '4. Data Security',
            content: (
              <>
                <p>
                  We implement industry-standard security measures to protect your personal
                  information, including:
                </p>
                <ul>
                  <li>Encryption of data in transit using TLS/SSL protocols;</li>
                  <li>Encryption of sensitive data at rest;</li>
                  <li>Regular security audits and vulnerability assessments;</li>
                  <li>Access controls and authentication mechanisms;</li>
                  <li>Secure data storage with appropriate physical and logical safeguards;</li>
                  <li>Employee training on data protection and security practices;</li>
                  <li>Incident response procedures for data breaches.</li>
                </ul>
                <p>
                  While we strive to protect your personal information, no method of transmission over
                  the Internet or electronic storage is 100% secure. We cannot guarantee absolute
                  security, and you acknowledge that you provide your information at your own risk.
                </p>
              </>
            ),
          },
          {
            id: 'cookies-tracking',
            title: '5. Cookies and Tracking',
            content: (
              <>
                <p>
                  We use cookies and similar tracking technologies to track activity on our services
                  and hold certain information. Cookies are files with a small amount of data which may
                  include an anonymous unique identifier.
                </p>
                <p>
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is
                  being sent. However, if you do not accept cookies, some portions of our services may
                  not function properly. For detailed information about our cookie practices, please
                  refer to our Cookie Policy.
                </p>
              </>
            ),
          },
          {
            id: 'your-rights',
            title: '6. Your Rights',
            content: (
              <>
                <p>
                  Depending on your jurisdiction, you may have the following rights regarding your
                  personal information:
                </p>
                <ul>
                  <li>
                    <strong>Right to Access:</strong> Request a copy of the personal information we
                    hold about you.
                  </li>
                  <li>
                    <strong>Right to Rectification:</strong> Request correction of inaccurate or
                    incomplete personal information.
                  </li>
                  <li>
                    <strong>Right to Erasure:</strong> Request deletion of your personal information,
                    subject to certain legal exceptions.
                  </li>
                  <li>
                    <strong>Right to Restrict Processing:</strong> Request that we limit how we use
                    your personal information.
                  </li>
                  <li>
                    <strong>Right to Data Portability:</strong> Request transfer of your personal
                    information in a structured, commonly used format.
                  </li>
                  <li>
                    <strong>Right to Object:</strong> Object to our processing of your personal
                    information.
                  </li>
                  <li>
                    <strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where we
                    rely on consent to process your information.
                  </li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us at{' '}
                  <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                    {EMAIL}
                  </a>
                  . We will respond to your request within thirty (30) days.
                </p>
              </>
            ),
          },
          {
            id: 'data-retention',
            title: '7. Data Retention',
            content: (
              <>
                <p>
                  We retain your personal information only for as long as necessary to fulfill the
                  purposes for which it was collected, including to satisfy any legal, accounting, or
                  reporting requirements.
                </p>
                <p>Specific retention periods include:</p>
                <ul>
                  <li>
                    <strong>Account Data:</strong> Retained for the duration of your account and up to
                    two (2) years after account deletion for legal and audit purposes.
                  </li>
                  <li>
                    <strong>Service Records:</strong> Retained for five (5) years after service
                    completion for compliance and quality assurance.
                  </li>
                  <li>
                    <strong>Marketing Communications:</strong> Email preferences retained until you
                    unsubscribe or withdraw consent.
                  </li>
                  <li>
                    <strong>Website Analytics:</strong> Aggregated and anonymized within ninety (90)
                    days.
                  </li>
                </ul>
              </>
            ),
          },
          {
            id: 'children',
            title: '8. Children&apos;s Privacy',
            content: (
              <>
                <p>
                  Our services are not intended for individuals under the age of eighteen (18). We do
                  not knowingly collect personal information from children. If we discover that a child
                  under eighteen (18) has provided us with personal information, we will delete such
                  information promptly.
                </p>
                <p>
                  If you are a parent or guardian and believe your child has provided us with personal
                  information, please contact us at{' '}
                  <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                    {EMAIL}
                  </a>{' '}
                  so we can take appropriate action.
                </p>
              </>
            ),
          },
          {
            id: 'international',
            title: '9. International Data Transfers',
            content: (
              <>
                <p>
                  Your information may be transferred to and processed in countries other than your
                  country of residence. These countries may have data protection laws that differ from
                  the laws of your country.
                </p>
                <p>
                  We take appropriate safeguards to ensure your data is protected in accordance with
                  applicable data protection laws, including implementing standard contractual clauses
                  and ensuring our service providers maintain adequate security measures.
                </p>
                <p>
                  By using our services, you consent to the transfer of your information to India and
                  other jurisdictions as described in this policy.
                </p>
              </>
            ),
          },
          {
            id: 'changes',
            title: '10. Changes to Privacy Policy',
            content: (
              <>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any
                  material changes by posting the new Privacy Policy on this page and updating the
                  &quot;Last Updated&quot; date.
                </p>
                <p>
                  For significant changes, we will provide notice through our website or by email at
                  least thirty (30) days before the changes take effect. We encourage you to review
                  this Privacy Policy periodically for any changes.
                </p>
              </>
            ),
          },
          {
            id: 'contact-us',
            title: '11. Contact Us',
            content: (
              <>
                <p>
                  If you have any questions about this Privacy Policy, please contact our Data
                  Protection Officer:
                </p>
                <ul>
                  <li>
                    <strong>Company:</strong> {COMPANY}
                  </li>
                  <li>
                    <strong>Address:</strong> {ADDRESS}
                  </li>
                  <li>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                      {EMAIL}
                    </a>
                  </li>
                </ul>
              </>
            ),
          },
        ],
      };

    case 'cookies':
      return {
        title: 'Cookie Policy',
        effectiveDate: EFFECTIVE_DATE,
        sections: [
          {
            id: 'what-are-cookies',
            title: '1. What Are Cookies',
            content: (
              <>
                <p>
                  Cookies are small text files that are stored on your device (computer, tablet, or
                  mobile phone) when you visit a website. They are widely used to make websites work
                  more efficiently, to improve the browsing experience, and to provide reporting
                  information to website owners.
                </p>
                <p>
                  Cookies can be &quot;persistent&quot; (remaining on your device until they expire or you
                  delete them) or &quot;session&quot; cookies (deleted when you close your browser). They can be
                  set by the website you are visiting (&quot;first-party cookies&quot;) or by third parties that
                  operate on the website&apos;s behalf (&quot;third-party cookies&quot;).
                </p>
                <p>
                  Similar technologies include web beacons (also known as pixel tags or clear GIFs),
                  local storage, and session storage, which function similarly to cookies.
                </p>
              </>
            ),
          },
          {
            id: 'how-we-use',
            title: '2. How We Use Cookies',
            content: (
              <>
                <p>{COMPANY} uses cookies for the following purposes:</p>
                <ul>
                  <li>
                    <strong>Essential Functionality:</strong> To enable core features such as
                    authentication, security, and session management.
                  </li>
                  <li>
                    <strong>Performance and Analytics:</strong> To understand how visitors interact
                    with our website, identify trends, and improve our services.
                  </li>
                  <li>
                    <strong>Functionality:</strong> To remember your preferences, settings, and
                    provide enhanced, personalized features.
                  </li>
                  <li>
                    <strong>Marketing and Advertising:</strong> To deliver relevant advertisements
                    and track the effectiveness of our marketing campaigns.
                  </li>
                  <li>
                    <strong>Security:</strong> To detect and prevent fraud, unauthorized access, and
                    other security threats.
                  </li>
                </ul>
              </>
            ),
          },
          {
            id: 'types',
            title: '3. Types of Cookies We Use',
            content: (
              <>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Strictly Necessary Cookies</h4>
                    <p>
                      These cookies are essential for the operation of our website. They enable core
                      functionality such as security, network management, and account access. You
                      cannot opt out of these cookies as the website cannot function properly without
                      them.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Examples: Session authentication tokens, CSRF protection tokens, security
                      preferences.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Performance Cookies</h4>
                    <p>
                      These cookies collect information about how visitors use our website, such as
                      which pages are visited most often and whether visitors receive error messages.
                      All information collected is aggregated and anonymized.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Examples: Google Analytics (_ga, _gid), performance metrics.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Functionality Cookies</h4>
                    <p>
                      These cookies allow the website to remember choices you make (such as your
                      language preference, theme, or region) and provide enhanced, personalized
                      features.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Examples: Theme preference, language settings, layout preferences.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Marketing Cookies</h4>
                    <p>
                      These cookies are used to deliver advertisements that are relevant to you and
                      your interests. They also help limit the number of times you see an
                      advertisement and measure the effectiveness of advertising campaigns.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Examples: Social media pixels, advertising platform cookies, retargeting
                      cookies.
                    </p>
                  </div>
                </div>
              </>
            ),
          },
          {
            id: 'managing',
            title: '4. Managing Cookies',
            content: (
              <>
                <p>
                  You have the right to decide whether to accept or reject cookies. You can manage
                  your cookie preferences in the following ways:
                </p>
                <ul>
                  <li>
                    <strong>Browser Settings:</strong> Most browsers allow you to control cookies
                    through their settings. You can set your browser to refuse all cookies, accept
                    only first-party cookies, or delete cookies when you close your browser.
                  </li>
                  <li>
                    <strong>Opt-Out Links:</strong> For third-party analytics and advertising cookies,
                    you can opt out through the respective third-party&apos;s website.
                  </li>
                  <li>
                    <strong>Do Not Track:</strong> Some browsers support a &quot;Do Not Track&quot; feature that
                    signals to websites that you do not want to be tracked.
                  </li>
                </ul>
                <p>
                  Please note that disabling certain cookies may affect the functionality of our
                  website and limit your ability to use some features.
                </p>
              </>
            ),
          },
          {
            id: 'third-party',
            title: '5. Third-Party Cookies',
            content: (
              <>
                <p>
                  We may use third-party services that set their own cookies on your device. These
                  include:
                </p>
                <ul>
                  <li>
                    <strong>Google Analytics:</strong> For website analytics and user behavior
                    tracking.
                  </li>
                  <li>
                    <strong>Google Fonts:</strong> For delivering web fonts used on our website.
                  </li>
                  <li>
                    <strong>Social Media Platforms:</strong> For social sharing features and embedded
                    content.
                  </li>
                  <li>
                    <strong>Payment Processors:</strong> For secure payment processing when applicable.
                  </li>
                </ul>
                <p>
                  We do not control these third-party cookies and recommend reviewing their respective
                  privacy and cookie policies for more information.
                </p>
              </>
            ),
          },
          {
            id: 'changes-cookie',
            title: '6. Changes to Cookie Policy',
            content: (
              <>
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in the cookies
                  we use or for other operational, legal, or regulatory reasons. We will post the
                  updated Cookie Policy on this page with a revised &quot;Last Updated&quot; date.
                </p>
                <p>
                  We encourage you to review this Cookie Policy periodically to stay informed about
                  our use of cookies and related technologies.
                </p>
              </>
            ),
          },
          {
            id: 'contact-cookie',
            title: '7. Contact Us',
            content: (
              <>
                <p>
                  If you have any questions about our use of cookies, please contact us:
                </p>
                <ul>
                  <li>
                    <strong>Company:</strong> {COMPANY}
                  </li>
                  <li>
                    <strong>Address:</strong> {ADDRESS}
                  </li>
                  <li>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                      {EMAIL}
                    </a>
                  </li>
                </ul>
              </>
            ),
          },
        ],
      };

    case 'disclaimer':
      return {
        title: 'Disclaimer',
        effectiveDate: EFFECTIVE_DATE,
        sections: [
          {
            id: 'general',
            title: '1. General Disclaimer',
            content: (
              <>
                <p>
                  The information provided by {COMPANY} on our website and through our services is
                  for general informational purposes only. All information on the site and our
                  services is provided in good faith; however, we make no representation or warranty
                  of any kind, express or implied, regarding the accuracy, adequacy, validity,
                  reliability, availability, or completeness of any information on our site or
                  services.
                </p>
                <p>
                  Under no circumstance shall {COMPANY} have any liability to you for any loss or
                  damage of any kind incurred as a result of the use of the site or reliance on any
                  information provided on the site. Your use of the site and your reliance on any
                  information on the site is solely at your own risk.
                </p>
              </>
            ),
          },
          {
            id: 'no-professional-advice',
            title: '2. No Professional Advice',
            content: (
              <>
                <p>
                  The information provided through our services does not constitute professional
                  advice of any kind, including but not limited to legal, financial, medical, or
                  technical advice. The content is for informational purposes only and should not be
                  relied upon as a substitute for professional advice from a qualified practitioner.
                </p>
                <p>
                  While {COMPANY} provides cybersecurity consulting and educational services, the
                  information shared through our website, blog posts, newsletters, and other content
                  should not be considered a complete or comprehensive security solution. Each
                  organization&apos;s security needs are unique and require individualized assessment.
                </p>
                <p>
                  Always seek the advice of qualified professionals for your specific needs and
                  circumstances.
                </p>
              </>
            ),
          },
          {
            id: 'service-availability',
            title: '3. Service Availability',
            content: (
              <>
                <p>
                  {COMPANY} strives to ensure that our services are available 24/7, but we do not
                  guarantee uninterrupted access. Our services may be unavailable due to:
                </p>
                <ul>
                  <li>Scheduled maintenance and updates;</li>
                  <li>Unforeseen technical issues or system failures;</li>
                  <li>Cybersecurity incidents or threats requiring emergency response;</li>
                  <li>Third-party service provider outages;</li>
                  <li>Force majeure events including natural disasters, pandemics, or government
                    actions;</li>
                  <li>Events beyond our reasonable control.</li>
                </ul>
                <p>
                  We will make reasonable efforts to provide advance notice of scheduled maintenance
                  but cannot guarantee that unscheduled downtime will not occur.
                </p>
              </>
            ),
          },
          {
            id: 'third-party-links',
            title: '4. Third-Party Links',
            content: (
              <>
                <p>
                  Our website may contain links to third-party websites or services that are not
                  owned or controlled by {COMPANY}. We have no control over and assume no
                  responsibility for the content, privacy policies, or practices of any third-party
                  websites or services.
                </p>
                <p>
                  We strongly advise you to read the terms and conditions and privacy policies of any
                  third-party websites or services that you visit. The inclusion of any link does not
                  imply endorsement by {COMPANY}.
                </p>
                <p>
                  {COMPANY} shall not be liable for any damage or loss caused or alleged to be caused
                  by or in connection with the use of or reliance on any such third-party content,
                  goods, or services available on or through any such websites or services.
                </p>
              </>
            ),
          },
          {
            id: 'accuracy',
            title: '5. Accuracy of Information',
            content: (
              <>
                <p>
                  While we endeavor to keep the information on our website accurate and up-to-date,
                  we make no representations or warranties of any kind, express or implied, about the
                  completeness, accuracy, reliability, suitability, or availability of the
                  information, products, services, or related graphics for any purpose.
                </p>
                <p>
                  In the fields of cybersecurity and artificial intelligence, technologies and best
                  practices evolve rapidly. Information that is accurate at the time of publication
                  may become outdated or incomplete. We recommend consulting with our team for the
                  most current information and recommendations.
                </p>
                <p>
                  Any reliance you place on such information is strictly at your own risk. We
                  recommend verifying critical information through independent sources.
                </p>
              </>
            ),
          },
          {
            id: 'limitation',
            title: '6. Limitation of Liability',
            content: (
              <>
                <p>
                  To the fullest extent permitted by applicable law, in no event shall {COMPANY},
                  its directors, employees, partners, agents, suppliers, or affiliates be liable for
                  any indirect, incidental, special, consequential, or punitive damages, including
                  without limitation, loss of profits, data, use, goodwill, or other intangible
                  losses, resulting from:
                </p>
                <ul>
                  <li>Your access to or use of or inability to access or use the website;</li>
                  <li>Any conduct or content of any third party on the website;</li>
                  <li>Any content obtained from the website;</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
                </ul>
                <p>
                  This disclaimer is in addition to and does not supersede the limitation of liability
                  provisions in our Terms and Conditions.
                </p>
              </>
            ),
          },
          {
            id: 'changes-disclaimer',
            title: '7. Changes to Disclaimer',
            content: (
              <>
                <p>
                  We reserve the right to modify this disclaimer at any time. Changes will be
                  effective immediately upon posting on the website with an updated &quot;Last Updated&quot;
                  date. Your continued use of the website after any changes constitutes acceptance of
                  the new disclaimer.
                </p>
                <p>
                  We encourage you to review this disclaimer periodically for any changes.
                </p>
              </>
            ),
          },
          {
            id: 'contact-disclaimer',
            title: '8. Contact Us',
            content: (
              <>
                <p>
                  For questions about this disclaimer, please contact us:
                </p>
                <ul>
                  <li>
                    <strong>Company:</strong> {COMPANY}
                  </li>
                  <li>
                    <strong>Address:</strong> {ADDRESS}
                  </li>
                  <li>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                      {EMAIL}
                    </a>
                  </li>
                </ul>
              </>
            ),
          },
        ],
      };

    case 'refund':
      return {
        title: 'Refund Policy',
        effectiveDate: EFFECTIVE_DATE,
        sections: [
          {
            id: 'eligibility',
            title: '1. Eligibility for Refund',
            content: (
              <>
                <p>
                  {COMPANY} is committed to ensuring customer satisfaction. We offer refunds under
                  the following conditions:
                </p>
                <ul>
                  <li>
                    The refund request is made within fifteen (15) business days of the original
                    purchase or service engagement date.
                  </li>
                  <li>
                    The service has not been substantially completed or delivered.
                  </li>
                  <li>
                    The request is accompanied by valid proof of purchase (receipt, invoice, or
                    transaction ID).
                  </li>
                  <li>
                    The request is not for a service that is explicitly marked as non-refundable.
                  </li>
                </ul>
                <p>
                  Refund eligibility is determined on a case-by-case basis, considering the nature of
                  the service, the extent of work completed, and the specific circumstances of the
                  request.
                </p>
              </>
            ),
          },
          {
            id: 'process',
            title: '2. Refund Process',
            content: (
              <>
                <p>To request a refund, please follow these steps:</p>
                <ol>
                  <li>
                    Send a refund request to{' '}
                    <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                      {EMAIL}
                  </a>{' '}
                    with the subject line &quot;Refund Request — [Your Order/Service ID].&quot;
                  </li>
                  <li>
                    Include the following details in your email: your full name, contact information,
                    order or service ID, date of purchase, reason for the refund request, and any
                    supporting documentation.
                  </li>
                  <li>
                    Our team will review your request within five (5) business days and respond with
                    the status of your refund.
                  </li>
                  <li>
                    If approved, the refund will be processed using the original payment method within
                    the timeframe specified in the Processing Time section.
                  </li>
                </ol>
                <p>
                  Partial refunds may be issued for services that have been partially completed, with
                  the refund amount calculated based on the percentage of work remaining.
                </p>
              </>
            ),
          },
          {
            id: 'non-refundable',
            title: '3. Non-Refundable Items',
            content: (
              <>
                <p>The following items and services are non-refundable:</p>
                <ul>
                  <li>
                    Completed cybersecurity assessments, penetration tests, or audit reports that
                    have been delivered to the client.
                  </li>
                  <li>
                    Digital products or materials that have been downloaded or accessed.
                  </li>
                  <li>
                    Educational courses or training programs where more than twenty-five percent (25%)
                    of the content has been accessed or the program duration has elapsed by more than
                    twenty-five percent (25%).
                  </li>
                  <li>
                    Custom development work that has been completed, delivered, and accepted by the
                    client.
                  </li>
                  <li>
                    Services rendered as part of an Annual Maintenance Contract (AMC) after the
                    service period has begun.
                  </li>
                  <li>
                    Consulting engagements where deliverables have been provided and accepted.
                  </li>
                  <li>
                    Promotional or discounted services purchased during special offers.
                  </li>
                </ul>
              </>
            ),
          },
          {
            id: 'service-specific',
            title: '4. Service-Specific Policies',
            content: (
              <>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Cybersecurity Services (VAPT, Forensics)</h4>
                    <p>
                      Refund requests must be made before the assessment begins. Once the assessment
                      has commenced, a partial refund may be available based on the work completed.
                      Reports delivered and acknowledged by the client are non-refundable.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Web & App Development</h4>
                    <p>
                      Milestone-based projects follow the refund terms specified in the individual
                      service agreement. Refunds for milestone payments are evaluated based on the
                      work completed at the time of the refund request. Initial deposits may be
                      non-refundable if significant project setup work has been performed.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">AI & ML Solutions</h4>
                    <p>
                      Custom AI/ML solutions follow the terms of the specific service agreement.
                      Refund eligibility depends on the stage of development and resources invested.
                      Pre-built AI tools and SaaS subscriptions follow the standard fifteen (15) day
                      refund policy.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Educational Programs</h4>
                    <p>
                      Full refund available if requested at least seven (7) days before the program
                      start date. Fifty percent (50%) refund if requested within seven (7) days of
                      the start date. No refund after twenty-five percent (25%) of the program has
                      been completed.
                    </p>
                  </div>
                </div>
              </>
            ),
          },
          {
            id: 'how-to-request',
            title: '5. How to Request a Refund',
            content: (
              <>
                <p>You can request a refund through any of the following methods:</p>
                <ul>
                  <li>
                    <strong>Email:</strong> Send your refund request to{' '}
                    <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                      {EMAIL}
                  </a>
                  </li>
                  <li>
                    <strong>Phone:</strong> Contact our customer support team during business hours
                    (Monday to Friday, 10:00 AM to 6:00 PM IST).
                  </li>
                  <li>
                    <strong>In Person:</strong> Visit our office at {ADDRESS} during business hours.
                  </li>
                </ul>
                <p>
                  Please have your order ID, transaction details, and reason for the refund ready
                  when contacting us. Providing complete information will help us process your
                  request more efficiently.
                </p>
              </>
            ),
          },
          {
            id: 'processing-time',
            title: '6. Processing Time',
            content: (
              <>
                <p>Refund processing times are as follows:</p>
                <ul>
                  <li>
                    <strong>Review Period:</strong> Five (5) business days from receipt of your
                    request.
                  </li>
                  <li>
                    <strong>Credit/Debit Card:</strong> Seven to fourteen (7–14) business days after
                    approval.
                  </li>
                  <li>
                    <strong>Bank Transfer (NEFT/IMPS):</strong> Five to seven (5–7) business days
                    after approval.
                  </li>
                  <li>
                    <strong>UPI:</strong> Three to five (3–5) business days after approval.
                  </li>
                  <li>
                    <strong>International Transfers:</strong> Ten to twenty-one (10–21) business days
                    after approval.
                  </li>
                </ul>
                <p>
                  The processing time depends on your payment provider and bank. {COMPANY} is not
                  responsible for delays caused by payment processors or banking institutions.
                </p>
              </>
            ),
          },
          {
            id: 'changes-refund',
            title: '7. Changes to Refund Policy',
            content: (
              <>
                <p>
                  We reserve the right to modify this Refund Policy at any time. Changes will be
                  effective immediately upon posting on the website with an updated &quot;Last Updated&quot;
                  date.
                </p>
                <p>
                  For significant changes, we will provide notice through our website at least
                  fifteen (15) days before the changes take effect. Refund requests made before the
                  effective date of any changes will be governed by the policy in effect at the time
                  of the request.
                </p>
              </>
            ),
          },
          {
            id: 'contact-refund',
            title: '8. Contact Us',
            content: (
              <>
                <p>
                  For questions about refunds or to request a refund, please contact us:
                </p>
                <ul>
                  <li>
                    <strong>Company:</strong> {COMPANY}
                  </li>
                  <li>
                    <strong>Address:</strong> {ADDRESS}
                  </li>
                  <li>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                      {EMAIL}
                    </a>
                  </li>
                </ul>
              </>
            ),
          },
        ],
      };
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function LegalPageModal({ isOpen, onClose, type }: LegalPageModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const content = getLegalContent(type);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Scroll to top when modal opens or type changes
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [isOpen, type]);

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="relative w-full max-w-3xl max-h-[90vh] bg-background overflow-hidden flex flex-col rounded-2xl border border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="legal-modal-title"
            >
              {/* Gradient border top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary" />

              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-border">
                <div>
                  <h2
                    id="legal-modal-title"
                    className="text-xl sm:text-2xl font-bold text-foreground"
                    style={{ fontFamily: 'var(--font-sora)' }}
                  >
                    {content.title}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last Updated: {content.effectiveDate}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 flex-shrink-0"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Table of Contents */}
              <div className="flex-shrink-0 px-6 sm:px-8 py-4 border-b border-border bg-secondary/20">
                <p
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
                  style={{ fontFamily: 'var(--font-sora)' }}
                >
                  Table of Contents
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {content.sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        const el = document.getElementById(`legal-${section.id}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-xs text-primary/80 hover:text-primary transition-colors inline-flex items-center gap-0.5"
                    >
                      <ChevronRight className="w-3 h-3" />
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Content */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 sm:px-8 py-6"
                style={{ scrollbarWidth: 'thin' }}
              >
                <div className="prose-legal max-w-none">
                  {content.sections.map((section, index) => (
                    <section
                      key={section.id}
                      id={`legal-${section.id}`}
                      className={`${
                        index > 0 ? 'mt-8 pt-8 border-t border-border/50' : ''
                      }`}
                    >
                      <h3
                        className="text-base sm:text-lg font-bold text-foreground mb-3"
                        style={{ fontFamily: 'var(--font-sora)' }}
                      >
                        {section.title}
                      </h3>
                      <div
                        className="text-sm leading-relaxed text-muted-foreground space-y-3"
                        style={{ fontFamily: 'var(--font-poppins)' }}
                      >
                        {section.content}
                      </div>
                    </section>
                  ))}

                  {/* Back to Top */}
                  <div className="mt-10 pt-6 border-t border-border/50 flex items-center justify-center">
                    <button
                      onClick={scrollToTop}
                      className="inline-flex items-center gap-2 text-sm text-primary/70 hover:text-primary transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                      Back to top
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-6 sm:px-8 py-4 border-t border-border bg-secondary/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    &copy; 2023 {COMPANY}. All rights reserved.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Questions?{' '}
                    <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                      {EMAIL}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
