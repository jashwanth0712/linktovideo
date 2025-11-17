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

  // Table to store analyzed offerings (products/services) for each domain
  offerings: defineTable({
    domainId: v.id("domains"), // Reference to the domain
    type: v.union(v.literal("product"), v.literal("service")), // Type of offering
    name: v.string(), // Name of the product/service
    description: v.string(), // Description of the offering
    analyzedAt: v.number(), // Timestamp when offering was analyzed
  })
    .index("by_domain", ["domainId"])
    .index("by_type", ["type"])
    .index("by_analyzed_at", ["analyzedAt"]),

  // Table to store voice-overs for services
  voiceOvers: defineTable({
    domainId: v.id("domains"), // Reference to the domain
    offeringId: v.optional(v.id("offerings")), // Reference to the offering (service)
    serviceName: v.string(), // Name of the service
    pitchText: v.string(), // The pitch script text
    audioStorageId: v.id("_storage"), // Storage ID for the audio file
    audioUrl: v.string(), // URL to access the audio file
    subtitlesStorageId: v.optional(v.id("_storage")), // Storage ID for subtitles file (SRT)
    subtitlesUrl: v.optional(v.string()), // URL to access the subtitles file
    voiceId: v.string(), // ElevenLabs voice ID used
    voiceName: v.string(), // Name of the voice used
    // Mixed audio with background music
    mixedAudioStorageId: v.optional(v.id("_storage")), // Storage ID for mixed audio (voice + BGM)
    mixedAudioUrl: v.optional(v.string()), // URL to access the mixed audio file
    bgmFileName: v.optional(v.string()), // Background music file name used
    bgmVolume: v.optional(v.number()), // BGM volume level (0-1)
    createdAt: v.number(), // Timestamp when voice-over was created
  })
    .index("by_domain", ["domainId"])
    .index("by_offering", ["offeringId"])
    .index("by_created_at", ["createdAt"]),
});
