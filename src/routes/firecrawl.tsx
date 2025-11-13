import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { BrandingData, Link, ExtractResult } from '../components/firecrawl/types'
import { StepIndicator } from '../components/firecrawl/StepIndicator'
import { ErrorAlert } from '../components/firecrawl/ErrorAlert'
import { BrandingForm } from '../components/firecrawl/BrandingForm'
import { BrandingResults } from '../components/firecrawl/BrandingResults'
import { MapStep } from '../components/firecrawl/MapStep'
import { ExtractResults } from '../components/firecrawl/ExtractResults'

export const Route = createFileRoute('/firecrawl')({
  component: Firecrawl,
})

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
  const createVideo = useMutation(api.mutations.createVideoForDomain)
  const domain = useQuery(
    api.queries.getDomain,
    url ? { url } : 'skip',
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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
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
                : 'Review extracted markdown content'}
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
          <ExtractResults
            results={extractResults}
            onBack={handleBack}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  )
}
