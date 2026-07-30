import { getCaseStudyBySlug, getCaseStudies } from '@/lib/case-studies'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/sections/Footer'
import Link from 'next/link'
import { ArrowLeft, Calendar, Building, ShieldCheck } from 'lucide-react'

// Allow static generation for published case studies
export async function generateStaticParams() {
  const caseStudies = await getCaseStudies()
  return caseStudies.map((study) => ({
    slug: study.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const study = await getCaseStudyBySlug(params.slug)
  if (!study) return { title: 'Case Study Not Found' }
  return {
    title: `${study.title} | ABWcurious Case Studies`,
    description: study.description,
  }
}

export default async function CaseStudyPage({ params }: { params: { slug: string } }) {
  const study = await getCaseStudyBySlug(params.slug)
  
  if (!study) {
    notFound()
  }

  // Parse HTML content or fallback
  const content = study.content || '<p>Detailed case study content coming soon.</p>'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Header Section */}
        <section className="relative pt-32 pb-16 overflow-hidden bg-muted/30">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-700/10 via-indigo-600/5 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/case-studies" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Case Studies
            </Link>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Building className="w-3.5 h-3.5" />
                {study.client}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(study.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6" style={{ fontFamily: "var(--font-sora)" }}>
              {study.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {study.description}
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {study.cover_image && (
              <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden mb-12 border border-border relative bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={study.cover_image} 
                  alt={study.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div 
              className="prose prose-lg dark:prose-invert prose-blue max-w-none prose-headings:font-bold prose-headings:font-sora prose-a:text-blue-500"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
