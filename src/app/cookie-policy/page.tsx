import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function CookiePolicy() {
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
          Cookie Policy
        </h1>
        <p className="text-sm text-foreground/60 mb-8">Last updated: March 2025</p>

        <div className="glass-card p-6 sm:p-8 space-y-6 text-foreground/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>1. Introduction</h2>
            <p>
              ABWcurious Pvt Ltd (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies and similar tracking technologies on our website at https://abwcurious.com and across our product platforms including CyberIntelligence360, TheCodeArena, StudySpark, and Restaurant360. This Cookie Policy explains what cookies are, how we use them, the types of cookies we use, and how you can manage your cookie preferences.
            </p>
            <p className="mt-3">
              This Cookie Policy is part of our Privacy Policy and should be read in conjunction with it. By accessing our website, you consent to the use of cookies as described in this policy, subject to your right to manage cookies as outlined below. This policy is compliant with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>2. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, provide a better browsing experience, and supply information to the owners of the site. Cookies allow websites to recognize your device and remember information about your visit, such as your preferred language, login credentials, and other settings.
            </p>
            <p className="mt-3">
              In addition to cookies, we may also use similar technologies such as web beacons (also known as pixel tags or clear GIFs), local storage, and session storage. These technologies function similarly to cookies and help us collect information about how you interact with our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>3. Types of Cookies We Use</h2>
            <p>We use the following categories of cookies on our website:</p>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-1">3.1 Strictly Necessary Cookies</h3>
                <p>
                  These cookies are essential for the operation of our website and cannot be disabled. They are set in response to your actions such as logging into your account, filling in forms, or setting privacy preferences. These cookies do not store any personally identifiable information. Examples include session cookies that maintain your logged-in state, CSRF protection tokens, and cookies that remember your consent preferences.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li><strong className="text-foreground">Session ID Cookies:</strong> Maintain your authenticated session on CyberIntelligence360, TheCodeArena, and StudySpark</li>
                  <li><strong className="text-foreground">Security Tokens:</strong> CSRF and XSS protection tokens that safeguard against security threats</li>
                  <li><strong className="text-foreground">Cookie Consent Cookie:</strong> Stores your cookie preferences so we can honor your choices</li>
                  <li><strong className="text-foreground">Load Balancing Cookies:</strong> Ensure consistent performance across our server infrastructure</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-1">3.2 Functional Cookies</h3>
                <p>
                  These cookies enable enhanced functionality and personalization of our website. They may be set by us or by third-party providers whose services we have added to our pages. If you do not allow these cookies, some or all of these services may not function properly.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li><strong className="text-foreground">Language Preferences:</strong> Remember your selected language for our platform interfaces</li>
                  <li><strong className="text-foreground">Dashboard Preferences:</strong> Store layout and display settings in CyberIntelligence360 and StudySpark dashboards</li>
                  <li><strong className="text-foreground">Chat Widget:</strong> Enable our customer support live chat functionality</li>
                  <li><strong className="text-foreground">Video Player Cookies:</strong> Remember your playback settings for AI Learning course videos</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-1">3.3 Analytics Cookies</h3>
                <p>
                  These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our website. They help us understand which pages are most and least popular, how visitors navigate around the site, and whether users encounter errors. All information collected by these cookies is aggregated and anonymized.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li><strong className="text-foreground">Page View Tracking:</strong> Understand which content and services are most valuable to our visitors</li>
                  <li><strong className="text-foreground">User Journey Analysis:</strong> Map how users navigate through our website to improve the user experience</li>
                  <li><strong className="text-foreground">Performance Monitoring:</strong> Track page load times and error rates to optimize site performance</li>
                  <li><strong className="text-foreground">Referral Tracking:</strong> Identify which channels drive the most qualified traffic to our services</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-1">3.4 Marketing Cookies</h3>
                <p>
                  These cookies may be set through our website by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other websites. They work by uniquely identifying your browser and device. If you do not allow these cookies, you will experience less targeted advertising.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li><strong className="text-foreground">Retargeting Cookies:</strong> Show relevant ABWcurious service ads to users who have visited our website</li>
                  <li><strong className="text-foreground">Conversion Tracking:</strong> Measure the effectiveness of our digital marketing campaigns</li>
                  <li><strong className="text-foreground">Social Media Cookies:</strong> Enable sharing of our content on social media platforms and track engagement</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>4. Third-Party Cookies</h2>
            <p>
              In addition to our own cookies, we may use cookies from the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Google Analytics:</strong> For website traffic analysis and user behavior insights. Google Analytics uses cookies to collect information about how visitors use our site. This data is aggregated and anonymized. For more information, see Google&apos;s Privacy Policy at https://policies.google.com/privacy</li>
              <li><strong className="text-foreground">Google Tag Manager:</strong> For managing tracking codes and analytics tags efficiently</li>
              <li><strong className="text-foreground">LinkedIn Insight Tag:</strong> For professional audience analytics and campaign measurement on LinkedIn</li>
              <li><strong className="text-foreground">Hotjar:</strong> For heatmaps, session recordings, and user feedback tools to improve our website UX</li>
              <li><strong className="text-foreground">Cloudflare:</strong> For CDN performance, DDoS protection, and bot management. Cloudflare sets cookies for security and performance purposes</li>
            </ul>
            <p className="mt-3">
              We do not control the setting of these third-party cookies and recommend that you review the privacy policies of these third-party providers for more information about their use of cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>5. How We Use Cookie Data</h2>
            <p>
              The data collected through cookies is used for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Security Enhancement:</strong> As a cybersecurity company, we use cookie data to detect and prevent unauthorized access, brute-force attacks, session hijacking, and other security threats to our platform</li>
              <li><strong className="text-foreground">Authentication:</strong> To verify your identity when you log into CyberIntelligence360, TheCodeArena, StudySpark, or Restaurant360</li>
              <li><strong className="text-foreground">Personalization:</strong> To tailor your experience by remembering your preferences, settings, and previous interactions</li>
              <li><strong className="text-foreground">Performance Optimization:</strong> To analyze site performance, identify bottlenecks, and improve page loading speeds</li>
              <li><strong className="text-foreground">Service Improvement:</strong> To understand how our users interact with our website and products, informing design and feature decisions</li>
              <li><strong className="text-foreground">Compliance:</strong> To maintain audit logs and compliance records as required by Indian cybersecurity regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>6. Cookie Duration</h2>
            <p>
              Cookies can be either session cookies or persistent cookies. Session cookies expire when you close your browser, while persistent cookies remain on your device for a set period or until manually deleted. Our cookie durations are as follows:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Session Cookies:</strong> Expire when you close your browser or log out of your account</li>
              <li><strong className="text-foreground">Strictly Necessary Cookies:</strong> Up to 1 year from the date of setting</li>
              <li><strong className="text-foreground">Functional Cookies:</strong> Up to 1 year from the date of setting</li>
              <li><strong className="text-foreground">Analytics Cookies:</strong> Up to 2 years from the date of setting (Google Analytics default)</li>
              <li><strong className="text-foreground">Marketing Cookies:</strong> Up to 2 years from the date of setting, or as determined by the third-party provider</li>
              <li><strong className="text-foreground">Cookie Consent Preference:</strong> 1 year from the date you set your preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>7. Managing Your Cookie Preferences</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences in the following ways:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-foreground">Cookie Consent Banner:</strong> When you first visit our website, a consent banner will appear allowing you to accept or customize your cookie preferences</li>
              <li><strong className="text-foreground">Browser Settings:</strong> Most browsers allow you to control cookies through their settings. You can set your browser to refuse all cookies, accept only first-party cookies, or delete cookies when you close your browser</li>
              <li><strong className="text-foreground">Opt-Out Links:</strong> For third-party advertising cookies, you can opt out through the Digital Advertising Alliance or the Network Advertising Initiative</li>
              <li><strong className="text-foreground">Google Analytics Opt-Out:</strong> You can install the Google Analytics opt-out browser add-on to prevent Google Analytics from tracking your visit</li>
            </ul>
            <p className="mt-3">
              Please note that disabling certain cookies may affect the functionality of our website and your ability to use some features of our products and services. Strictly necessary cookies cannot be disabled as they are essential for the website to function properly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>8. Cookies and Our Cybersecurity Services</h2>
            <p>
              As a cybersecurity and VAPT service provider, we may use additional cookies and tracking mechanisms within our client-facing security platforms. CyberIntelligence360, our threat intelligence platform, uses cookies to maintain authenticated sessions, store dashboard configurations, and track threat monitoring preferences. These cookies are essential for the security and functionality of the platform and are governed by separate service agreements with our clients.
            </p>
            <p className="mt-3">
              During VAPT engagements, our security scanning tools do not deposit cookies on client systems unless explicitly agreed upon in the Statement of Work. Any cookies used during security testing are temporary and are removed upon completion of the engagement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>9. Updates to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy periodically to reflect changes in the cookies we use, changes in technology, or for other operational, legal, or regulatory reasons. Any changes will be posted on this page with an updated &quot;Last updated&quot; date. If we make significant changes to this policy, we will provide additional notice through a cookie consent banner or email notification.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>10. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
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
