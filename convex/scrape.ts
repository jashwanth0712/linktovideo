import { action } from "./_generated/server";
import { v } from "convex/values";

export const scrapeWebsite = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    // Fetch the website HTML
    const response = await fetch(args.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch website");
    }

    const html = await response.text();

    // Parse the HTML to extract data
    const data = parseWebsiteData(html, args.url);

    return data;
  },
});

function parseWebsiteData(html: string, url: string) {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const name = titleMatch ? titleMatch[1].split("|")[0].trim() : new URL(url).hostname;

  // Extract colors from CSS
  const colors = extractColors(html);

  // Extract logo from common locations
  const logo = extractLogo(html, url);

  // Count products (estimate based on common patterns)
  const productCount = estimateProducts(html);

  return {
    name,
    url,
    logo,
    colors: colors.slice(0, 5),
    productCount,
    thumbnail: `/placeholder.svg?height=400&width=300&query=${encodeURIComponent(name)} website`,
  };
}

function extractColors(html: string): string[] {
  const colors = new Set<string>();

  // Common color patterns in CSS
  const colorPatterns = [
    /#[0-9a-fA-F]{6}\b/g,
    /rgb\([^)]+\)/g,
    /rgba\([^)]+\)/g,
  ];

  colorPatterns.forEach((pattern) => {
    const matches = html.match(pattern) || [];
    matches.forEach((color) => {
      if (color.length > 0) {
        colors.add(color);
      }
    });
  });

  // Add some default brand colors if few found
  const colorArray = Array.from(colors).slice(0, 10);
  if (colorArray.length < 3) {
    colorArray.push("#3b82f6", "#1f2937", "#ffffff");
  }

  return colorArray;
}

function extractLogo(html: string, url: string): string {
  // Look for common logo image patterns
  const logoPatterns = [
    /<img[^>]*(?:alt|title)[^>]*logo[^>]*src="([^"]+)"/i,
    /<img[^>]*src="([^"]+)"[^>]*(?:alt|title)[^>]*logo/i,
    /<link[^>]*rel="icon"[^>]*href="([^"]+)"/i,
  ];

  for (const pattern of logoPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let logoUrl = match[1];
      if (logoUrl.startsWith("/")) {
        const baseUrl = new URL(url);
        logoUrl = baseUrl.origin + logoUrl;
      } else if (!logoUrl.startsWith("http")) {
        logoUrl = new URL(url).origin + "/" + logoUrl;
      }
      return logoUrl;
    }
  }

  return "";
}

function estimateProducts(html: string): number {
  // Look for common product indicators
  const patterns = [
    /product/gi,
    /item/gi,
    /shop/gi,
    /<li[^>]*class="[^"]*product/gi,
  ];

  let maxCount = 0;
  patterns.forEach((pattern) => {
    const count = (html.match(pattern) || []).length;
    maxCount = Math.max(maxCount, count);
  });

  // Return a reasonable estimate between 5 and 50
  return Math.min(Math.max(maxCount || 12, 5), 50);
}

