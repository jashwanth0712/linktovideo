import { useState, useEffect } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Offering, BrandingData } from './types'

type PitchGenerationProps = {
  offerings: Offering[]
  brandingData: BrandingData | null
  selectedService: Offering | null
  onBack: () => void
  onReset: () => void
  onProceed: (pitchText: string, serviceName: string) => void
}

export function PitchGeneration({
  offerings,
  brandingData,
  selectedService: initialSelectedService,
  onBack,
  onReset,
  onProceed,
}: PitchGenerationProps) {
  const [selectedService, setSelectedService] = useState<Offering | null>(initialSelectedService || null)
  const [pitchLoading, setPitchLoading] = useState(false)
  const [generatedPitch, setGeneratedPitch] = useState<string | null>(null)
  const [editedPitch, setEditedPitch] = useState<string>('')
  const [pitchError, setPitchError] = useState<string | null>(null)
  const [showAskAI, setShowAskAI] = useState(false)
  const [userPrompt, setUserPrompt] = useState<string>('')

  const generatePitch = useAction(api.myFunctions.generatePitch)

  const services = offerings.filter((o) => o.type === 'service')

  // Sync selectedService when prop changes
  useEffect(() => {
    if (initialSelectedService) {
      setSelectedService(initialSelectedService)
    }
  }, [initialSelectedService])

  const handleServiceClick = (service: Offering) => {
    if (selectedService?.name === service.name) {
      setSelectedService(null)
      setGeneratedPitch(null)
      setEditedPitch('')
      setPitchError(null)
      setShowAskAI(false)
      setUserPrompt('')
    } else {
      setSelectedService(service)
      setGeneratedPitch(null)
      setEditedPitch('')
      setPitchError(null)
      setShowAskAI(false)
      setUserPrompt('')
    }
  }

  const handleCreatePitch = async () => {
    if (!selectedService) return

    setPitchLoading(true)
    setPitchError(null)
    setGeneratedPitch(null)
    setEditedPitch('')
    setShowAskAI(false)
    setUserPrompt('')

    try {
      const companyName = brandingData?.metadata?.title || undefined
      const companyDescription = brandingData?.metadata?.description || undefined

      const result = await generatePitch({
        serviceName: selectedService.name,
        serviceDescription: selectedService.description,
        companyName,
        companyDescription,
      })

      setGeneratedPitch(result.pitch)
      setEditedPitch(result.pitch)
    } catch (err) {
      setPitchError(err instanceof Error ? err.message : 'Failed to generate pitch')
    } finally {
      setPitchLoading(false)
    }
  }

  const handleRegeneratePitch = async () => {
    if (!selectedService) return

    setPitchLoading(true)
    setPitchError(null)

    try {
      const companyName = brandingData?.metadata?.title || undefined
      const companyDescription = brandingData?.metadata?.description || undefined

      const result = await generatePitch({
        serviceName: selectedService.name,
        serviceDescription: selectedService.description,
        companyName,
        companyDescription,
        userPrompt: userPrompt.trim() || undefined,
      })

      setGeneratedPitch(result.pitch)
      setEditedPitch(result.pitch)
      setShowAskAI(false)
      setUserPrompt('')
    } catch (err) {
      setPitchError(err instanceof Error ? err.message : 'Failed to regenerate pitch')
    } finally {
      setPitchLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Generate Voice-Over Pitch
          </h2>
          <p className="text-muted-foreground">
            {selectedService
              ? `Create a compelling 140-150 word pitch script for ${selectedService.name}`
              : 'Select a service and create a compelling 140-150 word pitch script'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-card-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md"
          >
            Back
          </button>
          <button
            onClick={onReset}
            className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-card-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md"
          >
            Start Over
          </button>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 shadow-lg">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-1">
                No Services Found
              </h3>
              <p className="text-sm text-muted-foreground">
                Please go back and analyze offerings first
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services Selection Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Select Service
                </h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {services.map((service, index) => {
                    const isSelected = selectedService?.name === service.name
                    return (
                      <div
                        key={index}
                        onClick={() => handleServiceClick(service)}
                        className={`group relative rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2 shadow-md'
                            : 'border-border bg-background hover:border-primary/50 hover:bg-accent/30 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 flex-shrink-0 rounded-full p-2 transition-colors ${
                              isSelected
                                ? 'bg-primary/20 text-primary'
                                : 'bg-chart-2/10 text-chart-2 group-hover:bg-primary/10 group-hover:text-primary'
                            }`}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-card-foreground truncate">
                                {service.name}
                              </h4>
                              {isSelected && (
                                <span className="flex-shrink-0 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Pitch Generation Panel */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedService ? (
              <div className="rounded-xl border border-border bg-card p-12 shadow-lg">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="rounded-full bg-primary/10 p-6">
                    <svg
                      className="h-12 w-12 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">
                      Select a Service to Begin
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Choose a service from the left panel to generate a professional voice-over pitch script
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Selected Service Info */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="rounded-full bg-primary/20 p-2">
                          <svg
                            className="h-5 w-5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-card-foreground">
                            {selectedService.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedService.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleCreatePitch}
                      disabled={pitchLoading}
                      className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pitchLoading ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Generating...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          Generate Pitch
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {pitchError && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <svg
                        className="h-5 w-5 text-destructive flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-destructive">{pitchError}</p>
                    </div>
                  </div>
                )}

                {generatedPitch && (
                  <div className="space-y-4">
                    {/* Pitch Editor */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                          <svg
                            className="h-5 w-5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Voice-Over Script
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowAskAI(!showAskAI)}
                            className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                          >
                            {showAskAI ? (
                              <span className="flex items-center gap-1.5">
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Cancel
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                  />
                                </svg>
                                Ask AI
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(editedPitch || generatedPitch)
                            }}
                            className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-card-foreground hover:bg-accent transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              Copy
                            </span>
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={editedPitch || generatedPitch}
                        onChange={(e) => setEditedPitch(e.target.value)}
                        className="w-full min-h-[300px] p-5 rounded-lg border border-border bg-background text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 font-mono leading-relaxed shadow-inner"
                        placeholder="Your voice-over script will appear here..."
                      />

                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">
                            {(editedPitch || generatedPitch)
                              .split(/\s+/)
                              .filter((word) => word.length > 0).length}
                          </span>{' '}
                          words
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          ✏️ Edit directly in the text area above
                        </p>
                      </div>
                    </div>

                    {/* Ask AI Panel */}
                    {showAskAI && (
                      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-lg">
                        <div className="mb-4">
                          <label
                            htmlFor="user-prompt"
                            className="block text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2"
                          >
                            <svg
                              className="h-4 w-4 text-primary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                            Customize Your Pitch
                          </label>
                          <p className="text-xs text-muted-foreground mb-3">
                            Provide specific instructions to customize the pitch. For example:
                            "Make it more technical", "Focus on cost savings", "Add more emotional
                            appeal", etc.
                          </p>
                          <textarea
                            id="user-prompt"
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            placeholder="E.g., Make it more professional and focus on ROI..."
                            className="w-full min-h-[120px] p-4 rounded-lg border border-border bg-background text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => {
                              setShowAskAI(false)
                              setUserPrompt('')
                            }}
                            className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-card-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleRegeneratePitch}
                            disabled={pitchLoading}
                            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                          >
                            {pitchLoading ? (
                              <span className="flex items-center gap-2">
                                <svg
                                  className="h-4 w-4 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Regenerating...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                                Regenerate
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Proceed to Voice-Over Button */}
                    {generatedPitch && (editedPitch || generatedPitch) && (
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={() => {
                            const pitchText = editedPitch || generatedPitch
                            const serviceName = selectedService?.name || 'Service'
                            onProceed(pitchText, serviceName)
                          }}
                          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center gap-2"
                        >
                          <span>Generate Voice-Over</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

