'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

export default function SeoAnalyzer() {
  const [url, setUrl] = useState('')
  const [userId, setUserId] = useState('66ff841224e715871789de29')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, userId }),
      })
      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  const StatusIcon = ({ condition }) => 
    condition ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />

  return (
    <div className="w-full max-w-4xl">
      <form onSubmit={handleSubmit} className="mb-8">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to analyze"
          required
          className="w-full px-4 py-2 text-gray-700 bg-white border rounded-md focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
      {analysis && (
        <div className="bg-blue text-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
          <h2 className="text-3xl font-bold mb-6">SEO Analysis Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
              <p><strong>Title:</strong> {analysis?.title}</p>
              <p><strong>Title Length:</strong> {analysis?.title.length} characters</p>
              <p><strong>Meta Description:</strong> {analysis?.metaDescription}</p>
              <p><strong>Meta Description Length:</strong> {analysis?.metaDescription.length} characters</p>
              <p><strong>Word Count:</strong> {analysis?.wordCount}</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Content Structure</h3>
              <p><strong>H1 Count:</strong> {analysis?.h1Count}</p>
              <p><strong>Images:</strong> {analysis?.imgCount}</p>
              <p><strong>Images without Alt Text:</strong> {analysis?.imgWithoutAlt}</p>
              <p><strong>Internal Links:</strong> {analysis?.internalLinks}</p>
              <p><strong>External Links:</strong> {analysis?.externalLinks}</p>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Technical SEO</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center">
                <StatusIcon condition={analysis?.hasViewportMeta} />
                <span className="ml-2">Responsive Design</span>
              </div>
              <div className="flex items-center">
                <StatusIcon condition={analysis?.hasStructuredData} />
                <span className="ml-2">Structured Data</span>
              </div>
              <div className="flex items-center">
                <StatusIcon condition={analysis?.hasOpenGraph} />
                <span className="ml-2">Open Graph Tags</span>
              </div>
              <div className="flex items-center">
                <StatusIcon condition={analysis?.hasTwitterCard} />
                <span className="ml-2">Twitter Card Tags</span>
              </div>
              <div className="flex items-center">
                <StatusIcon condition={analysis?.isSSL} />
                <span className="ml-2">SSL Certificate</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mt-8 mb-4">AI-Powered SEO Recommendations:</h3>
            <div className="bg-black text-white p-6 rounded-lg">
              <p className="whitespace-pre-wrap">{analysis?.recommendations}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}