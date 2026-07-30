import CaseStudiesClient from './CaseStudiesClient'
import { getCaseStudies } from '@/lib/case-studies'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case Studies | ABWcurious',
  description: 'Discover how we help enterprises secure their infrastructure and accelerate their digital transformation.',
}

// Revalidate every hour
export const revalidate = 3600

export default async function CaseStudiesPage() {
  const caseStudies = await getCaseStudies()
  
  return <CaseStudiesClient caseStudies={caseStudies} />
}
