"use node";

import { v } from 'convex/values'
import { action } from './_generated/server'
import { internal } from './_generated/api'

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
          results.push({
            url,
            error: `HTTP ${scrapeResponse.status}: ${errorText}`,
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

