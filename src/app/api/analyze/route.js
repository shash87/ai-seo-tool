import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as cheerio from 'cheerio'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const config = {
  maxDuration: 60, // Set maximum duration to 60 seconds
}

export async function POST(req) {
  const { url, userId } = await req.json()

  try {
    // Implement a timeout for the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    const html = await response.text()
    const $ = cheerio.load(html)

    const title = $('title').text()
    const metaDescription = $('meta[name="description"]').attr('content') || ''
    const h1Count = $('h1').length
    const wordCount = $('body').text().trim().split(/\s+/).length
    const imgCount = $('img').length
    const imgWithoutAlt = $('img:not([alt])').length
    const internalLinks = $('a[href^="/"], a[href^="' + url + '"]').length
    const externalLinks = $('a[href^="http"]:not([href^="' + url + '"])').length

    const hasViewportMeta = $('meta[name="viewport"]').length > 0
    const hasStructuredData = $('script[type="application/ld+json"]').length > 0
    const hasOpenGraph = $('meta[property^="og:"]').length > 0
    const hasTwitterCard = $('meta[name^="twitter:"]').length > 0
    const isSSL = url.startsWith('https')

    // Generate AI recommendations with a timeout
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const prompt = `As an advanced SEO expert, analyze the following website data and provide detailed, actionable recommendations:

    URL: ${url}
    Title (${title.length} chars): ${title}
    Meta Description (${metaDescription.length} chars): ${metaDescription}
    H1 Count: ${h1Count}
    Word Count: ${wordCount}
    Image Count: ${imgCount}
    Images without Alt Text: ${imgWithoutAlt}
    Internal Links: ${internalLinks}
    External Links: ${externalLinks}
    Has Viewport Meta Tag: ${hasViewportMeta}
    Has Structured Data: ${hasStructuredData}
    Has Open Graph Tags: ${hasOpenGraph}
    Has Twitter Card Tags: ${hasTwitterCard}
    Uses SSL: ${isSSL}

    Please provide a comprehensive SEO analysis including:
    1. Title and meta description optimization
    2. Content quality and relevance
    3. Heading structure
    4. Image optimization
    5. Internal and external linking strategy
    6. Mobile responsiveness
    7. Structured data implementation
    8. Social media optimization
    9. Security considerations
    10. Any other critical SEO factors

    For each point, explain why it's important and provide specific suggestions for improvement.`

    const aiAnalysisPromise = model.generateContent(prompt)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI analysis timeout')), 30000)
    )
    const result = await Promise.race([aiAnalysisPromise, timeoutPromise])

    const recommendations = result.response.text()

    // Save the analysis to the database
    const analysis = await prisma.seoAnalysis.create({
      data: {
        userId,
        url,
        title,
        metaDescription,
        h1Count,
        wordCount,
        imgCount,
        imgWithoutAlt,
        internalLinks,
        externalLinks,
        hasViewportMeta,
        hasStructuredData,
        hasOpenGraph,
        hasTwitterCard,
        isSSL,
        recommendations,
      },
    })

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error:', error)
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Fetching the webpage timed out' }, { status: 504 })
    }
    if (error.message === 'AI analysis timeout') {
      return NextResponse.json({ error: 'AI analysis timed out' }, { status: 504 })
    }
    return NextResponse.json({ error: 'An error occurred during analysis' }, { status: 500 })
  }
}