import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),

  // Table to store all scraped domains
  domains: defineTable({
    domain: v.string(), // e.g., "convex.dev"
    baseUrl: v.string(), // Full URL, e.g., "https://convex.dev"
    scrapedAt: v.number(), // Timestamp when domain was first scraped
  })
    .index("by_domain", ["domain"])
    .index("by_scraped_at", ["scrapedAt"]),

  // Table to store branding details for each domain
  branding: defineTable({
    domainId: v.id("domains"), // Reference to the domain
    brandingData: v.any(), // Full branding object from Firecrawl
    metadata: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        sourceURL: v.optional(v.string()),
      }),
    ),
    scrapedAt: v.number(), // Timestamp when branding was scraped
  })
    .index("by_domain", ["domainId"])
    .index("by_scraped_at", ["scrapedAt"]),

  // Table to store URL maps for each domain
  urlMaps: defineTable({
    domainId: v.id("domains"), // Reference to the domain
    url: v.string(), // The mapped URL
    title: v.optional(v.string()), // Page title if available
    description: v.optional(v.string()), // Page description if available
    mappedAt: v.number(), // Timestamp when URL was mapped
  })
    .index("by_domain", ["domainId"])
    .index("by_url", ["url"])
    .index("by_mapped_at", ["mappedAt"]),

  // Table to store scraped sub-pages with markdown content
  scrapedPages: defineTable({
    domainId: v.id("domains"), // Reference to the domain
    url: v.string(), // The scraped page URL
    markdown: v.string(), // The markdown content
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
    scrapedAt: v.number(), // Timestamp when page was scraped
  })
    .index("by_domain", ["domainId"])
    .index("by_url", ["url"])
    .index("by_scraped_at", ["scrapedAt"]),

  // Table to store generated videos for each domain
  videos: defineTable({
    domainId: v.id("domains"), // Reference to the domain
    videoUrl: v.string(), // The generated video URL
    title: v.optional(v.string()), // Video title (from domain metadata)
    description: v.optional(v.string()), // Video description
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
    ), // Video generation status
    createdAt: v.number(), // Timestamp when video was created
    completedAt: v.optional(v.number()), // Timestamp when video generation completed
  })
    .index("by_domain", ["domainId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),
});
