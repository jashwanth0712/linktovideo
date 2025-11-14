import { useState, useRef } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

type VoiceOverGenerationProps = {
  pitchText: string
  serviceName: string
  domainId: Id<'domains'>
  offeringId?: Id<'offerings'>
  onBack: () => void
  onReset: () => void
}

export function VoiceOverGeneration({
  pitchText,
  serviceName,
  domainId,
  offeringId,
  onBack,
  onReset,
}: VoiceOverGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [subtitlesUrl, setSubtitlesUrl] = useState<string | null>(null)
  const [subtitlesContent, setSubtitlesContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<string>('21m00Tcm4TlvDq8ikWAM')
  const audioRef = useRef<HTMLAudioElement>(null)

  const generateVoiceOver = useAction(api.myFunctions.generateVoiceOver)

  // Popular ElevenLabs voices
  const voices = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Professional Female' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Strong Female' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Soft Female' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Professional Male' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Young Female' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Deep Male' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Strong Male' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Calm Male' },
  ]

  const handleGenerate = async () => {
    if (!pitchText.trim()) {
      setError('No pitch text available')
      return
    }

    setIsGenerating(true)
    setError(null)
    setAudioUrl(null)
    setSubtitlesUrl(null)

    try {
      const result = await generateVoiceOver({
        text: pitchText,
        voiceId: selectedVoice,
        domainId,
        serviceName,
        offeringId,
      })

      setAudioUrl(result.audioUrl)
      setSubtitlesUrl(result.subtitlesUrl || null)
      
      // Fetch and display subtitles content
      if (result.subtitlesUrl) {
        try {
          const subtitlesResponse = await fetch(result.subtitlesUrl)
          const srtContent = await subtitlesResponse.text()
          setSubtitlesContent(srtContent)
        } catch (err) {
          console.error('Failed to load subtitles:', err)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate voice-over')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadAudio = () => {
    if (!audioUrl) return

    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `${serviceName.replace(/\s+/g, '_')}_voiceover.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadSubtitles = async () => {
    if (!subtitlesUrl) return

    try {
      const response = await fetch(subtitlesUrl)
      const srtContent = await response.text()
      
      const blob = new Blob([srtContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${serviceName.replace(/\s+/g, '_')}_subtitles.srt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download subtitles:', err)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Generate Voice-Over
          </h2>
          <p className="text-muted-foreground">
            Create a professional voice-over for your pitch script
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice Selection & Controls */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Service Info */}
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Service
              </h3>
              <p className="text-sm font-medium text-card-foreground">{serviceName}</p>
            </div>

            {/* Voice Selection */}
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
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                Select Voice
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-all ${
                      selectedVoice === voice.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                        : 'border-border bg-background hover:border-primary/50 hover:bg-accent/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          {voice.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {voice.description}
                        </p>
                      </div>
                      {selectedVoice === voice.id && (
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !pitchText.trim()}
              className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
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
                <span className="flex items-center justify-center gap-2">
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
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Generate Voice-Over
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Audio Player & Pitch Preview */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
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
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Audio Player */}
          {audioUrl && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
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
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                    Voice-Over Audio
                  </h3>
                  <div className="flex items-center gap-2">
                    {subtitlesUrl && (
                      <button
                        onClick={handleDownloadSubtitles}
                        className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-card-foreground hover:bg-accent transition-colors flex items-center gap-2"
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Download SRT
                      </button>
                    )}
                    <button
                      onClick={handleDownloadAudio}
                      className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-card-foreground hover:bg-accent transition-colors flex items-center gap-2"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download Audio
                    </button>
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="w-full"
                >
                  Your browser does not support the audio element.
                </audio>
              </div>

              {/* Subtitles Display
              {subtitlesUrl && (
                <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Subtitles (SRT)
                    </h3>
                    <button
                      onClick={handleDownloadSubtitles}
                      className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-card-foreground hover:bg-accent transition-colors flex items-center gap-2"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </button>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4 max-h-[300px] overflow-y-auto">
                    {subtitlesContent ? (
                      <p className="text-xs text-foreground font-mono whitespace-pre-wrap leading-relaxed">
                        {subtitlesContent}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Loading subtitles...
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    💡 Subtitles are automatically generated in SRT format and stored in Convex
                  </p>
                </div>
              )} */}
            </div>
          )}

          {/* Pitch Preview */}
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Pitch Script Preview
            </h3>
            <div className="rounded-lg border border-border bg-muted/30 p-4 max-h-[400px] overflow-y-auto">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {pitchText || 'No pitch text available'}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Word count: {pitchText.split(/\s+/).filter((word) => word.length > 0).length} words
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

