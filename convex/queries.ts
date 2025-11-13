import { v } from 'convex/values'
import { query } from './_generated/server'

// Helper function to extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

// Query to get domain by URL
export const getDomain = query({
  args: {
    url: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("domains"),
      domain: v.string(),
      baseUrl: v.string(),
      scrapedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const domain = extractDomain(args.url)
    const result = await ctx.db
      .query("domains")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .first()

    return result || null
  },
})

// Query to get branding for a domain
export const getBranding = query({
  args: {
    domainId: v.id("domains"),
  },
  returns: v.union(
    v.object({
      _id: v.id("branding"),
      domainId: v.id("domains"),
      brandingData: v.any(),
      metadata: v.optional(
        v.object({
          title: v.optional(v.string()),
          description: v.optional(v.string()),
          sourceURL: v.optional(v.string()),
        }),
      ),
      scrapedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("branding")
      .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
      .first()

    return result || null
  },
})

// Query to get URL maps for a domain
export const getUrlMaps = query({
  args: {
    domainId: v.id("domains"),
  },
  returns: v.array(
    v.object({
      _id: v.id("urlMaps"),
      domainId: v.id("domains"),
      url: v.string(),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      mappedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("urlMaps")
      .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
      .collect()

    return results
  },
})

// Query to get scraped pages for a domain
export const getScrapedPages = query({
  args: {
    domainId: v.id("domains"),
  },
  returns: v.array(
    v.object({
      _id: v.id("scrapedPages"),
      domainId: v.id("domains"),
      url: v.string(),
      markdown: v.string(),
      metadata: v.optional(
        v.object({
          title: v.optional(v.string()),
          description: v.optional(v.string()),
          sourceURL: v.optional(v.string()),
        }),
      ),
      extractedData: v.optional(
        v.object({
          tagline: v.optional(v.string()),
          products: v.optional(
            v.array(
              v.object({
                title: v.string(),
                description: v.string(),
              }),
            ),
          ),
          offerings: v.optional(v.array(v.string())),
        }),
      ),
      scrapedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("scrapedPages")
      .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
      .collect()

    return results
  },
})

