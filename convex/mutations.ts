import { v } from 'convex/values'
import { internalMutation, mutation } from './_generated/server'
import { Id } from './_generated/dataModel'

// Helper function to extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

// Mutation to save or get existing domain
export const saveDomain = internalMutation({
  args: {
    url: v.string(),
  },
  returns: v.id("domains"),
  handler: async (ctx, args) => {
    const domain = extractDomain(args.url)
    
    // Check if domain already exists
    const existing = await ctx.db
      .query("domains")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .first()

    if (existing) {
      return existing._id
    }

    // Create new domain entry
    const domainId = await ctx.db.insert("domains", {
      domain,
      baseUrl: args.url,
      scrapedAt: Date.now(),
    })

    return domainId
  },
})

// Mutation to save branding data
export const saveBranding = internalMutation({
  args: {
    domainId: v.id("domains"),
    brandingData: v.any(),
    metadata: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        sourceURL: v.optional(v.string()),
      }),
    ),
  },
  returns: v.id("branding"),
  handler: async (ctx, args) => {
    // Check if branding already exists for this domain
    const existing = await ctx.db
      .query("branding")
      .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
      .first()

    if (existing) {
      // Update existing branding
      await ctx.db.patch(existing._id, {
        brandingData: args.brandingData,
        metadata: args.metadata,
        scrapedAt: Date.now(),
      })
      return existing._id
    }

    // Create new branding entry
    const brandingId = await ctx.db.insert("branding", {
      domainId: args.domainId,
      brandingData: args.brandingData,
      metadata: args.metadata,
      scrapedAt: Date.now(),
    })

    return brandingId
  },
})

// Mutation to save URL maps
export const saveUrlMaps = internalMutation({
  args: {
    domainId: v.id("domains"),
    links: v.array(
      v.object({
        url: v.string(),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
      }),
    ),
  },
  returns: v.array(v.id("urlMaps")),
  handler: async (ctx, args) => {
    const mapIds: Id<"urlMaps">[] = []
    const now = Date.now()

    for (const link of args.links) {
      // Check if URL already exists in maps
      const existing = await ctx.db
        .query("urlMaps")
        .withIndex("by_url", (q) => q.eq("url", link.url))
        .first()

      if (existing) {
        // Update existing map entry
        await ctx.db.patch(existing._id, {
          title: link.title,
          description: link.description,
          mappedAt: now,
        })
        mapIds.push(existing._id)
      } else {
        // Create new map entry
        const mapId = await ctx.db.insert("urlMaps", {
          domainId: args.domainId,
          url: link.url,
          title: link.title,
          description: link.description,
          mappedAt: now,
        })
        mapIds.push(mapId)
      }
    }

    return mapIds
  },
})

// Mutation to save scraped page with markdown
export const saveScrapedPage = internalMutation({
  args: {
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
  },
  returns: v.id("scrapedPages"),
  handler: async (ctx, args) => {
    // Check if page already exists
    const existing = await ctx.db
      .query("scrapedPages")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first()

    if (existing) {
      // Update existing page
      await ctx.db.patch(existing._id, {
        markdown: args.markdown,
        metadata: args.metadata,
        extractedData: args.extractedData,
        scrapedAt: Date.now(),
      })
      return existing._id
    }

    // Create new page entry
    const pageId = await ctx.db.insert("scrapedPages", {
      domainId: args.domainId,
      url: args.url,
      markdown: args.markdown,
      metadata: args.metadata,
      extractedData: args.extractedData,
      scrapedAt: Date.now(),
    })

    return pageId
  },
})

// Mutation to create a video for a domain (internal)
export const createVideo = internalMutation({
  args: {
    domainId: v.id("domains"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.id("videos"),
  handler: async (ctx, args) => {
    // For now, hardcode a fixed video URL
    const videoUrl = "https://example.com/videos/sample-video.mp4"

    const videoId = await ctx.db.insert("videos", {
      domainId: args.domainId,
      videoUrl,
      title: args.title,
      description: args.description,
      status: "completed" as const,
      createdAt: Date.now(),
      completedAt: Date.now(),
    })

    return videoId
  },
})

// Public mutation to create a video for a domain
export const createVideoForDomain = mutation({
  args: {
    domainId: v.id("domains"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.id("videos"),
  handler: async (ctx, args) => {
    // For now, hardcode a fixed video URL
    const videoUrl = "https://example.com/videos/sample-video.mp4"

    const videoId = await ctx.db.insert("videos", {
      domainId: args.domainId,
      videoUrl,
      title: args.title,
      description: args.description,
      status: "completed" as const,
      createdAt: Date.now(),
      completedAt: Date.now(),
    })

    return videoId
  },
})

// Mutation to save an offering
export const saveOffering = internalMutation({
  args: {
    domainId: v.id("domains"),
    type: v.union(v.literal("product"), v.literal("service")),
    name: v.string(),
    description: v.string(),
  },
  returns: v.id("offerings"),
  handler: async (ctx, args) => {
    const offeringId = await ctx.db.insert("offerings", {
      domainId: args.domainId,
      type: args.type,
      name: args.name,
      description: args.description,
      analyzedAt: Date.now(),
    })

    return offeringId
  },
})

