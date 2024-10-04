import SeoAnalyzer from '@/components/SeoAnalyzer'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-12">
      <h1 className="text-4xl font-bold mb-8">AI SEO Analyzer</h1>
      <SeoAnalyzer />
    </main>
  )
}