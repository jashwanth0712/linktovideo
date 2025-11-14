import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { BrandingData, Link, ExtractResult, Offering } from '../components/firecrawl/types'
import { StepIndicator } from '../components/firecrawl/StepIndicator'
import { ErrorAlert } from '../components/firecrawl/ErrorAlert'
import { BrandingForm } from '../components/firecrawl/BrandingForm'
import { BrandingResults } from '../components/firecrawl/BrandingResults'
import { MapStep } from '../components/firecrawl/MapStep'
import { ExtractResults } from '../components/firecrawl/ExtractResults'
import { AnalyzeOfferings } from '../components/firecrawl/AnalyzeOfferings'
import { PitchGeneration } from '../components/firecrawl/PitchGeneration'
import { VoiceOverGeneration } from '../components/firecrawl/VoiceOverGeneration'

export const Route = createFileRoute('/firecrawl')({
  component: Firecrawl,
})

function Firecrawl() {
  const [url, setUrl] = useState('')
  const [step, setStep] = useState<'branding' | 'map' | 'extract' | 'analyze' | 'pitch' | 'voiceover'>('branding')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brandingData, setBrandingData] = useState<BrandingData | null>(null)
  const [mappedLinks, setMappedLinks] = useState<Link[]>([])
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [extractResults, setExtractResults] = useState<ExtractResult[]>([])
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [selectedService, setSelectedService] = useState<Offering | null>(null)
  const [pitchText, setPitchText] = useState<string>('')
  const [serviceName, setServiceName] = useState<string>('')

  const scrapeBranding = useAction(api.myFunctions.scrapeBranding)
  const mapWebsite = useAction(api.myFunctions.mapWebsite)
  const extractData = useAction(api.myFunctions.extractWebsiteData)
  const analyzeOfferings = useAction(api.myFunctions.analyzeOfferings)
  const createVideo = useMutation(api.mutations.createVideoForDomain)
  const domain = useQuery(
    api.queries.getDomain,
    url ? { url } : 'skip',
  )
  const domainOfferings = useQuery(
    api.queries.getOfferings,
    domain?._id ? { domainId: domain._id } : 'skip',
  )

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

      if (domain?._id) {
        try {
          await createVideo({
            domainId: domain._id,
            title: brandingData?.metadata?.title,
            description: brandingData?.metadata?.description,
          })
        } catch (videoError) {
          console.error('Failed to create video:', videoError)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract data')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!domain?._id || extractResults.length === 0) {
      setError('No content to analyze')
      return
    }

    setLoading(true)
    setError(null)
    setOfferings([])

    try {
      // Combine all markdown content
      const combinedMarkdown = extractResults
        .filter((r) => r.markdown)
        .map((r) => r.markdown)
        .join('\n\n---\n\n')

      if (!combinedMarkdown.trim()) {
        setError('No markdown content available to analyze')
        setLoading(false)
        return
      }

      const analyzedOfferings = await analyzeOfferings({
        domainId: domain._id,
        markdownContent: combinedMarkdown,
      })

      // Deduplicate offerings by name and type
      const seen = new Set<string>()
      const uniqueOfferings = analyzedOfferings.filter((o) => {
        const key = `${o.type}-${o.name}`
        if (seen.has(key)) {
          return false
        }
        seen.add(key)
        return true
      })

      setOfferings(uniqueOfferings)
      setStep('analyze')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze offerings')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 'voiceover') {
      setStep('pitch')
    } else if (step === 'pitch') {
      setStep('analyze')
    } else if (step === 'analyze') {
      setStep('extract')
      setOfferings([])
    } else if (step === 'extract') {
      setStep('map')
      setExtractResults([])
    } else {
      setStep('branding')
    }
  }

  const handleReset = () => {
    setUrl('')
    setStep('branding')
    setBrandingData(null)
    setMappedLinks([])
    setSelectedUrls(new Set())
    setExtractResults([])
    setOfferings([])
    setSelectedService(null)
    setPitchText('')
    setServiceName('')
    setError(null)
  }

  // Update offerings from query when available (only if we don't already have offerings)
  useEffect(() => {
    if (domainOfferings && domainOfferings.length > 0 && offerings.length === 0) {
      // Deduplicate offerings by name and type
      const seen = new Set<string>()
      const uniqueOfferings = domainOfferings
        .map((o) => ({
          type: o.type,
          name: o.name,
          description: o.description,
        }))
        .filter((o) => {
          const key = `${o.type}-${o.name}`
          if (seen.has(key)) {
            return false
          }
          seen.add(key)
          return true
        })

      setOfferings(uniqueOfferings)
    }
  }, [domainOfferings, offerings.length])

  return (
    <div className="min-h-screen bg-background">
      <main className={`container mx-auto px-4 py-8 ${step === 'pitch' || step === 'voiceover' ? 'max-w-7xl' : 'max-w-6xl'}`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            Website Data Extractor
          </h1>
          <p className="text-muted-foreground text-lg">
            {step === 'branding'
              ? 'Extract branding information and analyze website design'
              : step === 'map'
                ? 'Select pages to extract content from'
                : step === 'extract'
                  ? 'Review extracted markdown content'
                  : step === 'analyze'
                    ? 'Analyze offerings and services'
                    : step === 'pitch'
                      ? 'Generate professional voice-over pitch scripts'
                      : 'Create voice-over audio for your pitch'}
          </p>
        </div>

        <StepIndicator currentStep={step} />

        {error && <ErrorAlert message={error} />}

        {/* Branding Step */}
        {step === 'branding' && (
          <div className="space-y-6">
            <BrandingForm
              url={url}
              onUrlChange={setUrl}
              onSubmit={handleBrandingSubmit}
              loading={loading}
            />

            {brandingData && (
              <BrandingResults
                brandingData={brandingData}
                onProceed={handleProceedToMap}
                loading={loading}
              />
            )}
          </div>
        )}

        {/* Map Step */}
        {step === 'map' && (
          <MapStep
            mappedLinks={mappedLinks}
            selectedUrls={selectedUrls}
            onUrlToggle={handleUrlToggle}
            onSelectAll={handleSelectAll}
            onExtract={handleExtract}
            onBack={() => setStep('branding')}
            loading={loading}
          />
        )}

        {/* Extract Step */}
        {step === 'extract' && (
          <div className="space-y-6">
            <ExtractResults
              results={extractResults}
              onBack={handleBack}
              onReset={handleReset}
            />
            {extractResults.length > 0 && extractResults.some((r) => r.markdown) && (
              <div className="flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !domain?._id}
                  className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    'Analyze Offerings'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analyze Step */}
        {step === 'analyze' && (
          <AnalyzeOfferings
            offerings={offerings}
            loading={loading}
            onBack={handleBack}
            onReset={handleReset}
            onProceed={(service) => {
              setSelectedService(service)
              setStep('pitch')
            }}
          />
        )}

        {/* Pitch Generation Step */}
        {step === 'pitch' && (
          <PitchGeneration
            offerings={offerings}
            brandingData={brandingData}
            selectedService={selectedService}
            onBack={() => setStep('analyze')}
            onReset={handleReset}
            onProceed={(text, name) => {
              setPitchText(text)
              setServiceName(name)
              setStep('voiceover')
            }}
          />
        )}

        {/* Voice-Over Generation Step */}
        {step === 'voiceover' && domain?._id && (
          <VoiceOverGeneration
            pitchText={pitchText}
            serviceName={serviceName}
            domainId={domain._id}
            offeringId={
              domainOfferings?.find((o) => o.name === serviceName && o.type === 'service')?._id
            }
            onBack={() => setStep('pitch')}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  )
}
