import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/firecrawl')({
  component: Firecrawl,
})

type Link = {
  url: string
  title?: string
  description?: string
}

type ExtractResult = {
  url: string
  markdown?: string
  metadata?: {
    title?: string
    description?: string
    sourceURL?: string
  }
  error?: string
}

type BrandingData = {
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
    [key: string]: any // Allow any other fields
  }
  metadata?: {
    title?: string
    description?: string
    sourceURL?: string
  }
}

function Firecrawl() {
  const [url, setUrl] = useState('')
  const [step, setStep] = useState<'branding' | 'map' | 'extract'>('branding')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brandingData, setBrandingData] = useState<BrandingData | null>(null)
  const [mappedLinks, setMappedLinks] = useState<Link[]>([])
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [extractResults, setExtractResults] = useState<ExtractResult[]>([])

  const scrapeBranding = useAction(api.myFunctions.scrapeBranding)
  const mapWebsite = useAction(api.myFunctions.mapWebsite)
  const extractData = useAction(api.myFunctions.extractWebsiteData)

  const handleBrandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      setError('Please enter a valid URL')
      return
    }

    setLoading(true)
    setError(null)
    setBrandingData(null)

    try {
      const result = await scrapeBranding({ url: url.trim() })
      setBrandingData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape branding')
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToMap = async () => {
    setLoading(true)
    setError(null)
    setMappedLinks([])
    setSelectedUrls(new Set())

    try {
      const result = await mapWebsite({ url: url.trim(), limit: 20 })
      setMappedLinks(result.links)
      setStep('map')
      if (result.links.length === 0) {
        setError('No links found on this website')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to map website')
    } finally {
      setLoading(false)
    }
  }

  const handleUrlToggle = (linkUrl: string) => {
    const newSelected = new Set(selectedUrls)
    if (newSelected.has(linkUrl)) {
      newSelected.delete(linkUrl)
    } else {
      newSelected.add(linkUrl)
    }
    setSelectedUrls(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedUrls.size === mappedLinks.length) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(mappedLinks.map((link) => link.url)))
    }
  }

  const handleExtract = async () => {
    if (selectedUrls.size === 0) {
      setError('Please select at least one URL to extract')
      return
    }

    setLoading(true)
    setError(null)
    setExtractResults([])

    try {
      const urlsArray = Array.from(selectedUrls)
      const results = await extractData({ urls: urlsArray })
      setExtractResults(results)
      setStep('extract')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract data')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('map')
    setExtractResults([])
  }

  const handleReset = () => {
    setUrl('')
    setStep('branding')
    setBrandingData(null)
    setMappedLinks([])
    setSelectedUrls(new Set())
    setExtractResults([])
    setError(null)
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Website Data Extractor</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {step === 'branding'
          ? 'Enter a website URL to extract branding information, then proceed to map and extract data.'
          : step === 'map'
            ? 'Select which links to extract data from.'
            : 'Review the extracted data from selected URLs.'}
      </p>

      {step === 'branding' && (
        <>
          <form onSubmit={handleBrandingSubmit} className="mb-8">
            <div className="flex gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Scraping...' : 'Get Branding'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-md text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {brandingData && (
            <div className="space-y-6 mb-8">
              {brandingData.metadata && (
                <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-4">Page Information</h2>
                  {brandingData.metadata.title && (
                    <div className="mb-2">
                      <span className="font-semibold">Title: </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {brandingData.metadata.title}
                      </span>
                    </div>
                  )}
                  {brandingData.metadata.description && (
                    <div className="mb-2">
                      <span className="font-semibold">Description: </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {brandingData.metadata.description}
                      </span>
                    </div>
                  )}
                  {brandingData.metadata.sourceURL && (
                    <div>
                      <span className="font-semibold">URL: </span>
                      <span className="text-blue-600 dark:text-blue-400 break-all">
                        {brandingData.metadata.sourceURL}
                      </span>
                    </div>
                  )}
                </section>
              )}

              {brandingData.branding?.images && (
                <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-4">Images</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {brandingData.branding.images.logo && (
                      <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                          Logo
                        </h3>
                        <img
                          src={brandingData.branding.images.logo}
                          alt="Logo"
                          className="max-w-full h-24 object-contain mb-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <a
                          href={brandingData.branding.images.logo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 break-all hover:underline"
                        >
                          {brandingData.branding.images.logo}
                        </a>
                      </div>
                    )}
                    {brandingData.branding.images.favicon && (
                      <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                          Favicon
                        </h3>
                        <img
                          src={brandingData.branding.images.favicon}
                          alt="Favicon"
                          className="w-16 h-16 object-contain mb-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <a
                          href={brandingData.branding.images.favicon}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 break-all hover:underline"
                        >
                          {brandingData.branding.images.favicon}
                        </a>
                      </div>
                    )}
                    {brandingData.branding.images.ogImage && (
                      <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                          OG Image
                        </h3>
                        <img
                          src={brandingData.branding.images.ogImage}
                          alt="OG Image"
                          className="max-w-full h-24 object-contain mb-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <a
                          href={brandingData.branding.images.ogImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 break-all hover:underline"
                        >
                          {brandingData.branding.images.ogImage}
                        </a>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {brandingData.branding?.personality && (
                <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-4">Personality</h2>
                  <div className="space-y-3">
                    {brandingData.branding.personality.energy && (
                      <div className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          Energy:{' '}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          {brandingData.branding.personality.energy}
                        </span>
                      </div>
                    )}
                    {brandingData.branding.personality.tone && (
                      <div className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          Tone:{' '}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          {brandingData.branding.personality.tone}
                        </span>
                      </div>
                    )}
                    {brandingData.branding.personality.targetAudience && (
                      <div className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          Target Audience:{' '}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {brandingData.branding.personality.targetAudience}
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {brandingData.branding?.colorScheme && (
                <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-4">Color Scheme</h2>
                  <div className="p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                      {brandingData.branding.colorScheme}
                    </span>
                  </div>
                </section>
              )}

              {brandingData.branding?.designSystem && (
                <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-4">Design System</h2>
                  <div className="space-y-2">
                    {brandingData.branding.designSystem.framework && (
                      <div className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          Framework:{' '}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          {brandingData.branding.designSystem.framework}
                        </span>
                      </div>
                    )}
                    {brandingData.branding.designSystem.componentLibrary && (
                      <div className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          Component Library:{' '}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {brandingData.branding.designSystem.componentLibrary}
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {brandingData.branding?.confidence && (
                <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-4">Confidence Scores</h2>
                  <div className="space-y-2">
                    {brandingData.branding.confidence.overall !== undefined && (
                      <div className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            Overall
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {(brandingData.branding.confidence.overall * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${brandingData.branding.confidence.overall * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {brandingData.branding.confidence.colors !== undefined && (
                      <div className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            Colors
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {(brandingData.branding.confidence.colors * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${brandingData.branding.confidence.colors * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {brandingData.branding.confidence.buttons !== undefined && (
                      <div className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            Buttons
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {(brandingData.branding.confidence.buttons * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${brandingData.branding.confidence.buttons * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {brandingData.branding && (
                <>
                  {brandingData.branding.colors &&
                    (Array.isArray(brandingData.branding.colors)
                      ? brandingData.branding.colors.length > 0
                      : Object.keys(brandingData.branding.colors).length > 0) && (
                      <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">Colors</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Array.isArray(brandingData.branding.colors)
                            ? brandingData.branding.colors.map((color, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                                >
                                  {color.hex && (
                                    <div
                                      className="w-16 h-16 rounded-md mb-2 border border-gray-300 dark:border-gray-600"
                                      style={{ backgroundColor: color.hex }}
                                    />
                                  )}
                                  <div className="text-center">
                                    {color.name && (
                                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {color.name}
                                      </div>
                                    )}
                                    {color.hex && (
                                      <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                        {color.hex}
                                      </div>
                                    )}
                                    {color.rgb && (
                                      <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                                        {color.rgb}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            : Object.entries(brandingData.branding.colors).map(
                                ([name, hex], index) => (
                                  <div
                                    key={index}
                                    className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                                  >
                                    {hex && (
                                      <div
                                        className="w-16 h-16 rounded-md mb-2 border border-gray-300 dark:border-gray-600"
                                        style={{ backgroundColor: hex }}
                                      />
                                    )}
                                    <div className="text-center">
                                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {name}
                                      </div>
                                      {hex && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                          {hex}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ),
                              )}
                        </div>
                      </section>
                    )}

                  {brandingData.branding.fonts &&
                    (Array.isArray(brandingData.branding.fonts)
                      ? brandingData.branding.fonts.length > 0
                      : Object.keys(brandingData.branding.fonts).length > 0) && (
                      <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">Fonts</h2>
                        <div className="space-y-3">
                          {Array.isArray(brandingData.branding.fonts)
                            ? brandingData.branding.fonts.map(
                                (
                                  font: {
                                    family?: string
                                    size?: string
                                    weight?: string
                                  },
                                  index: number,
                                ) => (
                                  <div
                                    key={index}
                                    className="p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                                    style={{
                                      fontFamily: font.family || 'inherit',
                                      fontSize: font.size || 'inherit',
                                      fontWeight: font.weight || 'inherit',
                                    }}
                                  >
                                    <div className="text-sm">
                                      {font.family && (
                                        <span className="font-semibold">Family: </span>
                                      )}
                                      {font.family || 'Default'}
                                      {font.size && (
                                        <>
                                          {' '}
                                          <span className="font-semibold">Size: </span>
                                          {font.size}
                                        </>
                                      )}
                                      {font.weight && (
                                        <>
                                          {' '}
                                          <span className="font-semibold">Weight: </span>
                                          {font.weight}
                                        </>
                                      )}
                                    </div>
                                    <div className="mt-2 text-lg">
                                      The quick brown fox jumps over the lazy dog
                                    </div>
                                  </div>
                                ),
                              )
                            : (
                                <pre className="p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 overflow-auto text-xs">
                                  {JSON.stringify(brandingData.branding.fonts, null, 2)}
                                </pre>
                              )}
                        </div>
                      </section>
                    )}

                  {brandingData.branding.typography && (
                    <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h2 className="text-2xl font-semibold mb-4">Typography</h2>
                      <pre className="p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 overflow-auto text-xs">
                        {JSON.stringify(brandingData.branding.typography, null, 2)}
                      </pre>
                    </section>
                  )}

                  {brandingData.branding.spacing && (
                    <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h2 className="text-2xl font-semibold mb-4">Spacing</h2>
                      <pre className="p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 overflow-auto text-xs">
                        {JSON.stringify(brandingData.branding.spacing, null, 2)}
                      </pre>
                    </section>
                  )}

                  {brandingData.branding.components && (
                    <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h2 className="text-2xl font-semibold mb-4">Components</h2>
                      <pre className="p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 overflow-auto text-xs">
                        {JSON.stringify(brandingData.branding.components, null, 2)}
                      </pre>
                    </section>
                  )}
                </>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleProceedToMap}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Mapping...' : 'Next: Map Website'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {step === 'map' && (
        <>
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-md text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {mappedLinks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">
                  Found {mappedLinks.length} links
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('branding')}
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Back to Branding
                  </button>
                  <button
                    onClick={handleSelectAll}
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {selectedUrls.size === mappedLinks.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                  <button
                    onClick={handleExtract}
                    disabled={loading || selectedUrls.size === 0}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading
                      ? 'Extracting...'
                      : `Extract Selected (${selectedUrls.size})`}
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-4">
                {mappedLinks.map((link, index) => (
                  <label
                    key={index}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUrls.has(link.url)}
                      onChange={() => handleUrlToggle(link.url)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {link.title || link.url}
                      </div>
                      {link.description && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {link.description}
                        </div>
                      )}
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 truncate">
                        {link.url}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {step === 'extract' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              Extraction Results ({extractResults.length} URLs)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Selection
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-md text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {extractResults.map((result, index) => (
            <div
              key={index}
              className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400 break-all">
                {result.url}
              </h3>

              {result.error ? (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-md text-red-700 dark:text-red-400">
                  Error: {result.error}
                </div>
              ) : (
                <div className="space-y-4">
                  {result.metadata && (
                    <section className="pb-4 border-b border-gray-200 dark:border-gray-700">
                      {result.metadata.title && (
                        <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                          {result.metadata.title}
                        </h4>
                      )}
                      {result.metadata.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {result.metadata.description}
                        </p>
                      )}
                    </section>
                  )}

                  {result.markdown ? (
                    <section>
                      <h4 className="text-lg font-semibold mb-3">Markdown Content</h4>
                      <div className="p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono overflow-auto max-h-96">
                          {result.markdown}
                        </pre>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {result.markdown.length} characters scraped and saved to database
                      </p>
                    </section>
                  ) : (
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 rounded-md text-yellow-700 dark:text-yellow-400">
                      No markdown content available for this URL.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
