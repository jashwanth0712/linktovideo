"use node";

import { v } from 'convex/values'
import { action } from './_generated/server'
import { internal } from './_generated/api'
import { Agent } from '@convex-dev/agent'
import { components } from './_generated/api'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// Firecrawl scrape action - get branding information
/*
Sample output:
{ "__framework_hints": [], "__llm_button_reasoning": { "confidence": 0.95, "primary": { "index": 0, "reasoning": "Button #0 has a vibrant blue background (#6D6D70) which is a strong indicator for a primary CTA. The text 'Reset code' suggests an action-oriented purpose, making it the main call-to-action.", "text": "Reset code" }, "secondary": { "index": 3, "reasoning": "Button #3 has a white background (#FFFFFF), which is distinctly different from the primary button's blue background. It serves a less prominent action, making it suitable as the secondary button.", "text": "Always in sync" } }, "colorScheme": "light", "colors": { "accent": "#6D6D70", "background": "#FFFFFF", "link": "#F6EEDB", "primary": "#C693BB", "textPrimary": "#141414" }, "components": { "buttonPrimary": { "background": "#6D6D70", "borderColor": "#4F4F52", "borderRadius": "9999px", "shadow": "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px", "textColor": "#E5E5E5" }, "buttonSecondary": { "background": "#FFFFFF", "borderRadius": "0px", "shadow": "none", "textColor": "#E5E5E5" }, "input": { "borderColor": "#CCCCCC", "borderRadius": "4px" } }, "confidence": { "buttons": 0.95, "colors": 0.9, "overall": 0.925 }, "designSystem": { "componentLibrary": null, "framework": "tailwind" }, "fonts": [ { "family": "gtAmerica", "role": "body" } ], "images": { "favicon": "https://www.convex.dev/favicon.ico", "logo": "https://www.convex.dev/_next/image?url=%2Fhome%2Fframeworks-react.svg&w=96&q=75", "ogImage": "https://www.convex.dev/api/og?title=The%20backend%20platform%20that%20keeps%20your%20app%20in%20sync" }, "personality": { "energy": "medium", "targetAudience": "developers and tech enthusiasts", "tone": "modern" }, "spacing": { "baseUnit": 4, "borderRadius": "4px" }, "typography": { "fontFamilies": { "heading": "gtAmerica", "primary": "gtAmerica" }, "fontSizes": { "body": "14px", "h1": "38px", "h2": "32px" }, "fontStacks": { "body": [ "gtAmerica", "sans-serif" ], "heading": [ "gtAmerica", "sans-serif" ], "paragraph": [ "gtAmerica", "sans-serif" ] } } }
*/
export const scrapeBranding = action({
  args: {
    url: v.string(),
  },
  returns: v.object({
    branding: v.optional(v.any()),
    metadata: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        sourceURL: v.optional(v.string()),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set')
    }

    const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: args.url,
        formats: [{ type: 'branding' }, { type: 'markdown' }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Firecrawl API error: ${response.status} ${response.statusText} - ${errorText}`,
      )
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(`Firecrawl scraping failed: ${result.error || 'Unknown error'}`)
    }

    const brandingResult = {
      branding: result.data?.branding || undefined,
      metadata: result.data?.metadata
        ? {
            title: result.data.metadata.title || undefined,
            description: result.data.metadata.description || undefined,
            sourceURL: result.data.metadata.sourceURL || undefined,
          }
        : undefined,
    }

    // Save to database
    const domainId = await ctx.runMutation(internal.mutations.saveDomain, {
      url: args.url,
    })

    await ctx.runMutation(internal.mutations.saveBranding, {
      domainId,
      brandingData: brandingResult.branding,
      metadata: brandingResult.metadata,
    })

    return brandingResult
  },
})

// Firecrawl map action - get all URLs from a website
export const mapWebsite = action({
  args: {
    url: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    links: v.array(
      v.object({
        url: v.string(),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set')
    }

    const response = await fetch('https://api.firecrawl.dev/v2/map', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: args.url,
        limit: args.limit || 20,
        sitemap: 'include',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Firecrawl API error: ${response.status} ${response.statusText} - ${errorText}`,
      )
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(`Firecrawl mapping failed: ${result.error || 'Unknown error'}`)
    }

    const links = (result.links || []).map((link: any) => ({
      url: link.url,
      title: link.title || undefined,
      description: link.description || undefined,
    }))

    // Save to database
    const domainId = await ctx.runMutation(internal.mutations.saveDomain, {
      url: args.url,
    })

    await ctx.runMutation(internal.mutations.saveUrlMaps, {
      domainId,
      links,
    })

    return { links }
  },
})

// Firecrawl scrape action - scrape markdown for multiple URLs
export const extractWebsiteData = action({
  args: {
    urls: v.array(v.string()),
  },
  returns: v.array(
    v.object({
      url: v.string(),
      markdown: v.optional(v.string()),
      metadata: v.optional(
        v.object({
          title: v.optional(v.string()),
          description: v.optional(v.string()),
          sourceURL: v.optional(v.string()),
        }),
      ),
      error: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set')
    }

    // Get domain ID for saving
    const baseUrl = args.urls[0]
    const domainId = await ctx.runMutation(internal.mutations.saveDomain, {
      url: baseUrl,
    })

    const results: Array<{
      url: string
      markdown?: string
      metadata?: {
        title?: string
        description?: string
        sourceURL?: string
      }
      error?: string
    }> = []

    // Scrape markdown for each URL
    for (const url of args.urls) {
      try {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v2/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            url,
            formats: [{ type: 'markdown' }],
          }),
        })

        if (!scrapeResponse.ok) {
          const errorText = await scrapeResponse.text()
          // Parse HTML error responses to extract meaningful error messages
          let cleanError = errorText
          
          // Check if response is HTML
          if (errorText.trim().startsWith('<')) {
            // Try to extract title or h1 from HTML error pages
            const titleMatch = errorText.match(/<title[^>]*>([^<]+)<\/title>/i)
            const h1Match = errorText.match(/<h1[^>]*>([^<]+)<\/h1>/i)
            
            if (titleMatch) {
              cleanError = titleMatch[1].trim()
            } else if (h1Match) {
              cleanError = h1Match[1].trim()
            } else {
              // Fallback to status code description
              cleanError = `HTTP ${scrapeResponse.status} Error`
            }
          } else {
            // Try to parse JSON error if possible
            try {
              const jsonError = JSON.parse(errorText)
              cleanError = jsonError.error || jsonError.message || cleanError
            } catch {
              // If not JSON, use the text as-is but limit length
              cleanError = errorText.length > 200 
                ? errorText.substring(0, 200) + '...' 
                : errorText
            }
          }
          
          results.push({
            url,
            error: `HTTP ${scrapeResponse.status}: ${cleanError}`,
          })
          continue
        }

        const scrapeResult = await scrapeResponse.json()

        if (!scrapeResult.success) {
          results.push({
            url,
            error: scrapeResult.error || 'Failed to scrape page',
          })
          continue
        }

        const markdown = scrapeResult.data?.markdown || ''
        const metadata = scrapeResult.data?.metadata
          ? {
              title: scrapeResult.data.metadata.title || undefined,
              description: scrapeResult.data.metadata.description || undefined,
              sourceURL: scrapeResult.data.metadata.sourceURL || undefined,
            }
          : undefined

        // Save to database
        await ctx.runMutation(internal.mutations.saveScrapedPage, {
          domainId,
          url,
          markdown,
          metadata,
          extractedData: undefined, // No structured extraction, just markdown
        })

        results.push({
          url,
          markdown,
          metadata,
        })
      } catch (error) {
        console.error(`Failed to scrape markdown for ${url}:`, error)
        results.push({
          url,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        })
      }
    }

    return results
  },
})

// AI analysis action - analyze extracted content and extract offerings
export const analyzeOfferings = action({
  args: {
    domainId: v.id("domains"),
    markdownContent: v.string(),
  },
  returns: v.array(
    v.object({
      type: v.union(v.literal("product"), v.literal("service")),
      name: v.string(),
      description: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    try {
      // Initialize the agent
      const agent = new Agent(components.agent, {
        name: "offerings-analyzer",
        languageModel: openai("gpt-4o-mini"),
        instructions: "You are an AI assistant that analyzes website content and extracts offerings (products or services).",
      })

      // Create a thread for this analysis
      const { thread } = await agent.createThread(ctx, {
        title: "Analyze Offerings",
        summary: "Extract products and services from website content",
      })

      const prompt = `
Analyze the following website content and extract all offerings (products or services).

Website Content:
${args.markdownContent.substring(0, 50000)}
`

      // Define the schema using zod
      const offeringSchema = z.object({
        offerings: z.array(
          z.object({
            type: z.enum(["product", "service"]),
            name: z.string(),
            description: z.string(),
          })
        ),
      })

      // Use thread.generateObject with zod schema
      const result = await thread.generateObject({
        prompt,
        schema: offeringSchema,
      })

      const offerings = result.object.offerings as {
        type: "product" | "service"
        name: string
        description: string
      }[]

      // Save to DB
      for (const offering of offerings) {
        await ctx.runMutation(internal.mutations.saveOffering, {
          domainId: args.domainId,
          type: offering.type,
          name: offering.name,
          description: offering.description,
        })
      }

      return offerings
    } catch (error) {
      console.error("AI analysis error:", error)
      throw new Error(
        `Failed to analyze offerings: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  },
})

// AI action - generate voice-over pitch script for a service
export const generatePitch = action({
  args: {
    serviceName: v.string(),
    serviceDescription: v.string(),
    companyName: v.optional(v.string()),
    companyDescription: v.optional(v.string()),
    userPrompt: v.optional(v.string()),
  },
  returns: v.object({
    pitch: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      // Initialize the agent
      const agent = new Agent(components.agent, {
        name: "pitch-generator",
        languageModel: openai("gpt-4o-mini"),
        instructions: "You are an AI assistant that creates compelling, creative voice-over pitch scripts for products and services. Write engaging, persuasive content that tells a story.",
      })

      // Create a thread for this generation
      const { thread } = await agent.createThread(ctx, {
        title: "Generate Pitch",
        summary: "Create voice-over pitch script for service",
      })

      const companyInfo = args.companyName 
        ? `Company: ${args.companyName}${args.companyDescription ? `\nCompany Description: ${args.companyDescription}` : ''}`
        : ''

      // Base prompt structure
      let basePrompt = `
Create a compelling voice-over pitch script for the following service. The pitch should be exactly 140-150 words and follow this structure:

1. Problem - Start by describing the problem or pain point this service solves (2-3 sentences)
2. Introducing... - Transition with "Introducing [service name]" (1 sentence)
3. [Company Name] Features - Describe the key features and benefits of the service (3-4 sentences)
4. Tagline - End with a memorable tagline or call-to-action (1 sentence)

Service Details:
Service Name: ${args.serviceName}
Service Description: ${args.serviceDescription}
${companyInfo}
`

      // If user provided a custom prompt, incorporate it
      if (args.userPrompt && args.userPrompt.trim()) {
        basePrompt += `\n\nAdditional Requirements from User:\n${args.userPrompt}\n\nPlease incorporate these requirements while maintaining the structure above.`
      } else {
        basePrompt += `\n\nMake it creative, engaging, and persuasive. Write in a conversational tone suitable for a voice-over. Ensure the total word count is between 140-150 words.`
      }

      // Define the schema using zod
      const pitchSchema = z.object({
        pitch: z.string().describe("The complete voice-over pitch script (140-150 words)"),
      })

      // Use thread.generateObject with zod schema
      const result = await thread.generateObject({
        prompt: basePrompt,
        schema: pitchSchema,
      })

      return {
        pitch: result.object.pitch,
      }
    } catch (error) {
      console.error("Pitch generation error:", error)
      throw new Error(
        `Failed to generate pitch: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  },
})

// Helper function to generate SRT subtitles from text
function generateSRT(text: string): string {
  const words = text.split(/\s+/).filter(word => word.length > 0)
  const wordsPerSubtitle = 8 // Approximate words per subtitle
  const subtitleDuration = 3000 // 3 seconds per subtitle in milliseconds
  const subtitles: string[] = []
  
  let startTime = 0
  let subtitleIndex = 1
  
  for (let i = 0; i < words.length; i += wordsPerSubtitle) {
    const subtitleWords = words.slice(i, i + wordsPerSubtitle)
    const subtitleText = subtitleWords.join(' ')
    
    const start = formatSRTTime(startTime)
    const end = formatSRTTime(startTime + subtitleDuration)
    
    subtitles.push(`${subtitleIndex}`)
    subtitles.push(`${start} --> ${end}`)
    subtitles.push(subtitleText)
    subtitles.push('')
    
    startTime += subtitleDuration
    subtitleIndex++
  }
  
  return subtitles.join('\n')
}

function formatSRTTime(ms: number): string {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const milliseconds = ms % 1000
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`
}

// Voice name mapping
const voiceNames: Record<string, string> = {
  '21m00Tcm4TlvDq8ikWAM': 'Rachel',
  'AZnzlk1XvdvUeBnXmlld': 'Domi',
  'EXAVITQu4vr4xnSDxMaL': 'Bella',
  'ErXwobaYiN019PkySvjV': 'Antoni',
  'MF3mGyEYCl7XYWbV9V6O': 'Elli',
  'TxGEqnHWrfWFTfGW9XjX': 'Josh',
  'VR6AewLTigWG4xSOukaG': 'Arnold',
  'pNInz6obpgDQGcFmaJgB': 'Adam',
}

// ElevenLabs voice-over generation action
// Updated to include domainId, serviceName, and offeringId for storage
// This action stores both audio and subtitles files in Convex storage
// @ts-ignore TS7022 - TypeScript circular reference, will resolve after Convex regenerates types
export const generateVoiceOver = action({
  args: {
    text: v.string(),
    voiceId: v.optional(v.string()),
    domainId: v.id("domains"),
    serviceName: v.string(),
    offeringId: v.optional(v.id("offerings")),
  },
  returns: v.object({
    audioUrl: v.string(),
    audioStorageId: v.id("_storage"),
    subtitlesUrl: v.optional(v.string()),
    subtitlesStorageId: v.optional(v.id("_storage")),
    voiceOverId: v.id("voiceOvers"),
  }),
  // @ts-ignore TS7023 - TypeScript circular reference, will resolve after Convex regenerates types
  handler: async (ctx, args) => {
    try {
      const apiKey = process.env.ELEVENLABS_API_KEY
      if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY environment variable is not set')
      }

      // Default to a professional voice if not specified
      const voiceId = args.voiceId || '21m00Tcm4TlvDq8ikWAM' // Rachel - professional female voice
      const voiceName = voiceNames[voiceId] || 'Unknown'

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text: args.text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`
        )
      }

      // Get audio as ArrayBuffer
      const audioBuffer = await response.arrayBuffer()
      
      // Store audio file in Convex storage
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audioStorageId = await ctx.storage.store(audioBlob)
      const audioUrl = await ctx.storage.getUrl(audioStorageId)
      
      if (!audioUrl) {
        throw new Error('Failed to get audio file URL from storage')
      }

      // Generate SRT subtitles
      const srtContent = generateSRT(args.text)
      const subtitlesBlob = new Blob([srtContent], { type: 'text/plain' })
      const subtitlesStorageId = await ctx.storage.store(subtitlesBlob)
      const subtitlesUrl = await ctx.storage.getUrl(subtitlesStorageId)

      // Save voice-over to database
      // @ts-ignore - internal.mutations.saveVoiceOver will be available after Convex regenerates types
      const voiceOverId = await ctx.runMutation(internal.mutations.saveVoiceOver, {
        domainId: args.domainId,
        offeringId: args.offeringId,
        serviceName: args.serviceName,
        pitchText: args.text,
        audioStorageId,
        audioUrl,
        subtitlesStorageId,
        subtitlesUrl: subtitlesUrl || undefined,
        voiceId,
        voiceName,
      })

      return {
        audioUrl,
        audioStorageId,
        subtitlesUrl: subtitlesUrl || undefined,
        subtitlesStorageId,
        voiceOverId,
      }
    } catch (error) {
      console.error('Voice-over generation error:', error)
      throw new Error(
        `Failed to generate voice-over: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  },
})

