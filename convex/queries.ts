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
      _creationTime: v.number(),
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
      _creationTime: v.number(),
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
      _creationTime: v.number(),
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
      _creationTime: v.number(),
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

// Query to get all videos with domain information
export const getAllVideos = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("videos"),
      _creationTime: v.number(),
      domainId: v.id("domains"),
      videoUrl: v.string(),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.union(
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed"),
      ),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
      domain: v.optional(
        v.object({
          _id: v.id("domains"),
          _creationTime: v.number(),
          domain: v.string(),
          baseUrl: v.string(),
          scrapedAt: v.number(),
        }),
      ),
    }),
  ),
  handler: async (ctx) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_created_at")
      .order("desc")
      .collect()

    // Enrich with domain information
    const videosWithDomain = await Promise.all(
      videos.map(async (video) => {
        const domain = await ctx.db.get(video.domainId)
        return {
          ...video,
          domain: domain || undefined,
        }
      }),
    )

    return videosWithDomain
  },
})

// Query to get videos for a specific domain
export const getVideosByDomain = query({
  args: {
    domainId: v.id("domains"),
  },
  returns: v.array(
    v.object({
      _id: v.id("videos"),
      _creationTime: v.number(),
      domainId: v.id("domains"),
      videoUrl: v.string(),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.union(
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed"),
      ),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
      .collect()

    return videos
  },
})

// Query to get offerings for a domain
export const getOfferings = query({
  args: {
    domainId: v.id("domains"),
  },
  returns: v.array(
    v.object({
      _id: v.id("offerings"),
      _creationTime: v.number(),
      domainId: v.id("domains"),
      type: v.union(v.literal("product"), v.literal("service")),
      name: v.string(),
      description: v.string(),
      analyzedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const offerings = await ctx.db
      .query("offerings")
      .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
      .collect()

    return offerings
  },
})

