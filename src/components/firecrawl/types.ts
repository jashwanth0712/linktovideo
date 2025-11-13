export type Link = {
  url: string
  title?: string
  description?: string
}

export type ExtractResult = {
  url: string
  markdown?: string
  metadata?: {
    title?: string
    description?: string
    sourceURL?: string
  }
  error?: string
}

export type BrandingData = {
  branding?: {
    colors?: Record<string, string> | Array<{ hex?: string; rgb?: string; name?: string }>
    fonts?: Array<{ family?: string; size?: string; weight?: string }> | Record<string, any>
    typography?: any
    spacing?: any
    components?: any
    images?: {
      logo?: string
      favicon?: string
      ogImage?: string
    }
    personality?: {
      energy?: string
      tone?: string
      targetAudience?: string
    }
    colorScheme?: string
    designSystem?: {
      framework?: string
      componentLibrary?: string | null
    }
    confidence?: {
      overall?: number
      colors?: number
      buttons?: number
    }
    [key: string]: any
  }
  metadata?: {
    title?: string
    description?: string
    sourceURL?: string
  }
}

