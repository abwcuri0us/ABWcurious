import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function Disclaimer() {
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
          Disclaimer
        </h1>
        <p className="text-sm text-foreground/60 mb-8">Last updated: March 2025</p>

        <div className="glass-card p-6 sm:p-8 space-y-6 text-foreground/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>1. General Disclaimer</h2>
            <p>
              The information provided on the ABWcurious Pvt Ltd website at https://abwcurious.com and through our products and services is for general informational purposes only. While we endeavor to keep the information up to date and accurate, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on our website for any purpose.
            </p>
            <p className="mt-3">
              Any reliance you place on such information is therefore strictly at your own risk. In no event will ABWcurious Pvt Ltd be liable for any loss or damage, including but not limited to indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website and our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>2. Cybersecurity and VAPT Services Disclaimer</h2>
            <p>
              Our cybersecurity and Vulnerability Assessment and Penetration Testing (VAPT) services are conducted based on the scope defined in the mutually agreed Statement of Work (SOW). The findings, recommendations, and reports provided are based on the state of the systems, networks, and applications at the time of testing and do not represent a guarantee of future security posture. Cybersecurity threats evolve rapidly, and new vulnerabilities may be discovered at any time after our assessment.
            </p>
            <p className="mt-3">
              <strong className="text-foreground">Important limitations of our VAPT services include:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li>VAPT assessments are point-in-time evaluations and do not guarantee continuous security</li>
              <li>The absence of identified vulnerabilities does not confirm that systems are completely secure or impenetrable</li>
              <li>Testing is limited to the scope defined in the SOW; systems, applications, or network segments outside the scope are not assessed</li>
              <li>Zero-day vulnerabilities and undisclosed security flaws may exist that our testing methodologies cannot detect</li>
              <li>The effectiveness of implemented remediation recommendations depends on proper execution and ongoing maintenance by the client</li>
              <li>We do not guarantee that following our recommendations will prevent all security breaches or cyberattacks</li>
              <li>Social engineering tests, where included, simulate real-world attack scenarios but may not represent the full spectrum of social engineering threats</li>
            </ul>
            <p className="mt-3">
              Clients are advised to conduct regular security assessments and maintain continuous monitoring through our CyberIntelligence360 platform or equivalent security information and event management (SIEM) solutions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>3. Digital Forensics Disclaimer</h2>
            <p>
              Our digital forensics services are provided with the understanding that forensic investigations are subject to inherent limitations. The preservation, collection, and analysis of digital evidence may be affected by factors including but not limited to the time elapsed since the incident, the extent of system changes made after the incident, the availability and integrity of log files, and the technical complexity of the case.
            </p>
            <p className="mt-3">
              ABWcurious Pvt Ltd conducts forensic investigations following industry-standard methodologies and chain-of-custody procedures. However, we do not guarantee that all relevant evidence will be recovered or that our findings will be admissible in any particular legal proceeding. The interpretation and legal implications of our forensic findings should be evaluated by qualified legal counsel. Our forensic reports represent our professional opinion based on the evidence available and the methodologies employed, and should not be construed as legal advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>4. Web and App Development Disclaimer</h2>
            <p>
              The websites, web applications, and mobile applications developed by ABWcurious Pvt Ltd are built according to the specifications and requirements agreed upon with the client. While we follow industry best practices for coding standards, security, and performance, we do not guarantee that the developed software will be free from defects, bugs, or vulnerabilities. Software development is an iterative process, and post-deployment maintenance and updates are essential for ongoing security and functionality.
            </p>
            <p className="mt-3">
              Project timelines provided are estimates and may vary based on the complexity of requirements, responsiveness of stakeholders, availability of third-party APIs and services, and other factors beyond our control. We are not responsible for issues arising from third-party services, plugins, or integrations that are not developed or maintained by ABWcurious Pvt Ltd. Any warranty for development work is limited to the warranty period specified in the applicable development agreement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>5. AI Learning and StudySpark Disclaimer</h2>
            <p>
              Our AI Learning programs and the StudySpark platform provide educational content related to artificial intelligence, machine learning, cybersecurity, and related technology domains. The educational content is provided for learning purposes only and does not constitute professional advice, certification, or guarantee of employment outcomes.
            </p>
            <p className="mt-3">
              While we strive to provide accurate and up-to-date educational material, the field of artificial intelligence and cybersecurity evolves rapidly. Course content may not always reflect the very latest developments, tools, or techniques. The application of skills learned through our programs is the sole responsibility of the learner. We do not guarantee that completion of our courses will result in specific career outcomes, job placements, or professional certifications unless explicitly stated.
            </p>
            <p className="mt-3">
              Any practical exercises or lab environments provided through StudySpark and TheCodeArena are for educational purposes only. Users must not apply techniques learned in our courses against systems they do not own or have explicit written authorization to test. ABWcurious Pvt Ltd is not responsible for any misuse of knowledge or skills acquired through our educational programs.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>6. Digital Marketing Disclaimer</h2>
            <p>
              Our digital marketing services, including search engine optimization (SEO), search engine marketing (SEM), social media marketing, and content marketing, are provided based on current best practices and platform guidelines. Results from digital marketing efforts are influenced by numerous external factors including market conditions, competition, search engine algorithm changes, platform policy updates, and audience behavior.
            </p>
            <p className="mt-3">
              ABWcurious Pvt Ltd does not guarantee specific rankings on search engines, traffic volumes, conversion rates, or revenue outcomes from our digital marketing services. Any projections, estimates, or benchmarks discussed during the engagement are based on historical data and industry averages and should not be interpreted as promises or guarantees of future performance. Marketing strategies and campaigns may require ongoing optimization and adjustment based on performance data and changing market conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>7. Product Disclaimers</h2>
            <p className="font-medium text-foreground mb-2">7.1 CyberIntelligence360</p>
            <p>
              CyberIntelligence360 provides threat intelligence, security monitoring, and vulnerability tracking capabilities. The threat intelligence data is aggregated from multiple sources and is provided as-is. We do not guarantee the completeness or timeliness of threat intelligence feeds. False positives and false negatives may occur in security monitoring. Users should implement a defense-in-depth strategy and not rely solely on CyberIntelligence360 for their security posture.
            </p>
            <p className="font-medium text-foreground mb-2 mt-4">7.2 TheCodeArena</p>
            <p>
              TheCodeArena is a coding and development platform. Code submissions, evaluations, and rankings are based on automated assessment systems and may not account for all possible approaches or solutions. The platform is provided for educational and skill development purposes.
            </p>
            <p className="font-medium text-foreground mb-2 mt-4">7.3 StudySpark</p>
            <p>
              StudySpark provides AI-powered learning tools and educational content. AI-generated content, summaries, and recommendations may occasionally contain inaccuracies. Users should verify critical information from authoritative sources. The platform is designed as a learning aid and should not replace comprehensive study materials or professional instruction.
            </p>
            <p className="font-medium text-foreground mb-2 mt-4">7.4 Restaurant360</p>
            <p>
              Restaurant360 is currently in development (&quot;coming soon&quot;). Any features, capabilities, or descriptions presented on our website are preliminary and subject to change prior to the official launch. We do not guarantee that the final product will match the currently displayed specifications.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>8. Third-Party Links and Content</h2>
            <p>
              Our website may contain links to third-party websites or display content from third-party sources. These links are provided for your convenience and information only. We have no control over the nature, content, and availability of those sites or services. The inclusion of any links does not necessarily imply a recommendation or endorsement of the views expressed within them.
            </p>
            <p className="mt-3">
              ABWcurious Pvt Ltd takes no responsibility for, and will not be liable for, the website being temporarily unavailable due to technical issues beyond our control. Any third-party content, products, or services accessed through our website are governed by the terms and conditions of those respective third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>9. No Professional Advice</h2>
            <p>
              The content on our website and in our marketing materials does not constitute professional advice of any kind, including but not limited to legal, financial, regulatory, or compliance advice. While we are experts in cybersecurity and technology, our website content should not be relied upon as a substitute for professional advice tailored to your specific situation. Always consult qualified professionals for advice regarding your particular circumstances and legal requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, ABWcurious Pvt Ltd disclaims all liability for any loss, damage, or injury arising from or in connection with the use of our website, products, or services, except where such liability cannot be excluded under Indian law. This disclaimer does not affect your statutory rights as a consumer under the Consumer Protection Act, 2019 or any other applicable Indian legislation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>11. Contact Us</h2>
            <p>
              If you have any questions about this Disclaimer, please contact us:
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
