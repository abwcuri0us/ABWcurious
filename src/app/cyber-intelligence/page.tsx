import type { Metadata } from 'next';
import CyberClient from './CyberClient';

export const metadata: Metadata = {
  title: 'Cyber Intelligence & Security | ABWcurious',
  description:
    'ABWcurious offers advanced cybersecurity solutions: security audits, penetration testing, threat monitoring, access control, SIEM, and IT security training for businesses and students.',
  keywords: 'cybersecurity India, penetration testing, SIEM, threat monitoring, security audits, IT security training ABWcurious, EdTech cybersecurity',
};

export default function CyberIntelligencePage() {
  return <CyberClient />;
}
