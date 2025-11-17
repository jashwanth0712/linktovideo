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

// Available background music files - dynamically list all files in bg-scores
const bgmFiles = [
  { name: 'The Big Idea', file: '/bg-scores/The Big Idea.mp3' },
  { name: 'Dream It Big', file: '/bg-scores/Dream It Big.mp3' },
  { name: 'Shiny Little Lie', file: '/bg-scores/Shiny Little Lie.mp3' },
]

// Voice sample files should be placed in public/voice-samples/ folder
// File naming convention: {voiceId}.mp3 (e.g., 21m00Tcm4TlvDq8ikWAM.mp3)

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
  const [mixedAudioUrl, setMixedAudioUrl] = useState<string | null>(null)
  const [subtitlesUrl, setSubtitlesUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<string>('21m00Tcm4TlvDq8ikWAM')
  const [selectedBGM, setSelectedBGM] = useState<string | null>(null)
  const [bgmVolume, setBgmVolume] = useState<number>(0.3) // Default 30% volume
  const [isMixing, setIsMixing] = useState(false)
  const [voiceOverId, setVoiceOverId] = useState<Id<'voiceOvers'> | null>(null)
  const [playingBGM, setPlayingBGM] = useState<string | null>(null)
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const mixedAudioRef = useRef<HTMLAudioElement>(null)
  const bgmPreviewRef = useRef<HTMLAudioElement>(null)
  const voiceSampleRef = useRef<HTMLAudioElement>(null)

  // @ts-expect-error - generateVoiceOver will be available after Convex regenerates types
  const generateVoiceOver = useAction(api.myFunctions.generateVoiceOver)
  const generateMixedAudioUploadUrl = useAction(api.myFunctions.generateMixedAudioUploadUrl)
  const saveMixedAudioMetadata = useAction(api.myFunctions.saveMixedAudioMetadata)

  // Popular ElevenLabs voices with sample file paths
  const voices = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Professional Female', sampleFile: '/voice-samples/21m00Tcm4TlvDq8ikWAM.mp3' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Strong Female', sampleFile: '/voice-samples/AZnzlk1XvdvUeBnXmlld.mp3' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Soft Female', sampleFile: '/voice-samples/EXAVITQu4vr4xnSDxMaL.mp3' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Professional Male', sampleFile: '/voice-samples/ErXwobaYiN019PkySvjV.mp3' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Young Female', sampleFile: '/voice-samples/MF3mGyEYCl7XYWbV9V6O.mp3' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Deep Male', sampleFile: '/voice-samples/TxGEqnHWrfWFTfGW9XjX.mp3' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Strong Male', sampleFile: '/voice-samples/VR6AewLTigWG4xSOukaG.mp3' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Calm Male', sampleFile: '/voice-samples/pNInz6obpgDQGcFmaJgB.mp3' },
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
      setVoiceOverId(result.voiceOverId)
      setSubtitlesUrl(result.subtitlesUrl || null)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate voice-over')
    } finally {
      setIsGenerating(false)
    }
  }

  // Function to mix voice audio with background music using Web Audio API
  const handleMixAudio = async () => {
    if (!audioUrl || !selectedBGM || !voiceOverId) {
      setError('Please generate voice-over and select background music first')
      return
    }

    setIsMixing(true)
    setError(null)

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Load voice audio
      const voiceResponse = await fetch(audioUrl)
      const voiceArrayBuffer = await voiceResponse.arrayBuffer()
      const voiceAudioBuffer = await audioContext.decodeAudioData(voiceArrayBuffer)
      
      // Load BGM audio
      const bgmResponse = await fetch(selectedBGM)
      const bgmArrayBuffer = await bgmResponse.arrayBuffer()
      const bgmAudioBuffer = await audioContext.decodeAudioData(bgmArrayBuffer)
      
      // Get the sample rate from voice audio
      const sampleRate = voiceAudioBuffer.sampleRate
      
      // Create a new audio buffer for the mixed output
      const mixedBuffer = audioContext.createBuffer(
        voiceAudioBuffer.numberOfChannels,
        voiceAudioBuffer.length,
        sampleRate
      )
      
      // Mix voice audio (full volume) - use faster copy method
      for (let channel = 0; channel < voiceAudioBuffer.numberOfChannels; channel++) {
        const voiceData = voiceAudioBuffer.getChannelData(channel)
        const mixedData = mixedBuffer.getChannelData(channel)
        // Use set() for faster copying (native optimized method)
        mixedData.set(voiceData)
      }
      
      // Mix BGM audio (with volume control and loop if needed)
      const bgmSampleRate = bgmAudioBuffer.sampleRate
      const ratio = bgmSampleRate / sampleRate // Calculate once outside loop
      const bgmLength = bgmAudioBuffer.length
      const totalSamples = mixedBuffer.length
      
      for (let channel = 0; channel < Math.min(bgmAudioBuffer.numberOfChannels, mixedBuffer.numberOfChannels); channel++) {
        const bgmData = bgmAudioBuffer.getChannelData(channel)
        const mixedData = mixedBuffer.getChannelData(channel)
        
        // Optimized resampling and mixing
        // Process in chunks to allow UI updates and prevent blocking
        const chunkSize = 100000 // Process 100k samples at a time
        
        for (let chunkStart = 0; chunkStart < totalSamples; chunkStart += chunkSize) {
          const chunkEnd = Math.min(chunkStart + chunkSize, totalSamples)
          
          for (let i = chunkStart; i < chunkEnd; i++) {
            // Calculate BGM index with looping
            const bgmIndex = (i * ratio) % bgmLength
            const index = Math.floor(bgmIndex)
            const nextIndex = (index + 1) % bgmLength
            const fraction = bgmIndex - index
            
            // Linear interpolation for smoother resampling
            const bgmValue = (bgmData[index] * (1 - fraction) + bgmData[nextIndex] * fraction) * bgmVolume
            mixedData[i] = Math.max(-1, Math.min(1, mixedData[i] + bgmValue))
          }
          
          // Yield to event loop every chunk to prevent UI freezing
          if (chunkEnd < totalSamples) {
            await new Promise(resolve => setTimeout(resolve, 0))
          }
        }
      }
      
      // Convert mixed buffer to WAV blob
      const wavBlob = audioBufferToWav(mixedBuffer)
      
      // Generate upload URL from Convex
      const { uploadUrl } = await generateMixedAudioUploadUrl({})
      
      // Upload file directly to Convex storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'audio/wav' },
        body: wavBlob,
      })
      
      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload audio: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }
      
      // Get storage ID from response
      const { storageId } = await uploadResponse.json()
      
      // Save metadata and get final URL
      const bgmFileName = bgmFiles.find(bgm => bgm.file === selectedBGM)?.name || 'Unknown'
      const result = await saveMixedAudioMetadata({
        voiceOverId,
        storageId,
        bgmFileName,
        bgmVolume,
      })
      
      setMixedAudioUrl(result.mixedAudioUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mix audio with background music')
      console.error('Audio mixing error:', err)
    } finally {
      setIsMixing(false)
    }
  }

  // Helper function to convert AudioBuffer to WAV Blob
  function audioBufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2)
    const view = new DataView(arrayBuffer)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * numberOfChannels * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numberOfChannels * 2, true)
    view.setUint16(32, numberOfChannels * 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * numberOfChannels * 2, true)
    
    // Convert float samples to 16-bit PCM
    let offset = 44
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
        offset += 2
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' })
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

  // Handle BGM selection with preview (toggle play/pause)
  const handleBGMSelect = (bgmFile: string) => {
    // If clicking the same BGM that's currently playing, stop it
    if (playingBGM === bgmFile && bgmPreviewRef.current) {
      bgmPreviewRef.current.pause()
      bgmPreviewRef.current.currentTime = 0
      setPlayingBGM(null)
      return
    }

    // Otherwise, select and play the new BGM
    setSelectedBGM(bgmFile)
    setPlayingBGM(bgmFile)
    
    // Stop any currently playing BGM
    if (bgmPreviewRef.current) {
      bgmPreviewRef.current.pause()
      bgmPreviewRef.current.currentTime = 0
    }
    
    // Play the selected BGM preview
    if (bgmPreviewRef.current && bgmFile) {
      bgmPreviewRef.current.src = bgmFile
      bgmPreviewRef.current.play().catch(err => {
        console.error('Failed to play BGM preview:', err)
        setPlayingBGM(null)
      })
    }
  }

  // Handle voice selection with sample preview (toggle play/pause)
  const handleVoiceSelect = (voiceId: string) => {
    const voice = voices.find(v => v.id === voiceId)
    if (!voice) return

    // If clicking the same voice that's currently playing, stop it
    if (playingVoice === voiceId && voiceSampleRef.current) {
      voiceSampleRef.current.pause()
      voiceSampleRef.current.currentTime = 0
      setPlayingVoice(null)
      setSelectedVoice(voiceId) // Still update selection
      return
    }

    // Otherwise, select and play the new voice sample
    setSelectedVoice(voiceId)
    setPlayingVoice(voiceId)
    
    // Stop any currently playing voice sample
    if (voiceSampleRef.current) {
      voiceSampleRef.current.pause()
      voiceSampleRef.current.currentTime = 0
    }

    // Play the voice sample from local file
    if (voiceSampleRef.current && voice.sampleFile) {
      voiceSampleRef.current.src = voice.sampleFile
      voiceSampleRef.current.play().catch(err => {
        console.error('Failed to play voice sample:', err)
        setPlayingVoice(null)
        setError(`Failed to load voice sample for ${voice.name}. Please ensure the file exists at ${voice.sampleFile}`)
      })
    }
  }

  // Handle audio end events
  const handleBGMEnd = () => {
    setPlayingBGM(null)
  }

  const handleVoiceSampleEnd = () => {
    setPlayingVoice(null)
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
                    onClick={() => handleVoiceSelect(voice.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-all ${
                      selectedVoice === voice.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                        : 'border-border bg-background hover:border-primary/50 hover:bg-accent/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-card-foreground">
                            {voice.name}
                          </p>
                          {playingVoice === voice.id && (
                            <svg
                              className="h-4 w-4 text-primary animate-pulse"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </div>
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
              {/* Hidden audio element for voice sample preview */}
              <audio
                ref={voiceSampleRef}
                onEnded={handleVoiceSampleEnd}
                className="hidden"
              />
            </div>

            {/* Background Music Selection */}
            {audioUrl && (
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
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                  Background Music
                </h3>
                <div className="space-y-4">
                  {/* BGM Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground">
                      Select Background Music
                    </label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {bgmFiles.map((bgm) => (
                        <button
                          key={bgm.file}
                          onClick={() => handleBGMSelect(bgm.file)}
                          className={`w-full text-left rounded-lg border p-3 transition-all ${
                            selectedBGM === bgm.file
                              ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                              : 'border-border bg-background hover:border-primary/50 hover:bg-accent/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-card-foreground">
                                  {bgm.name}
                                </p>
                                {playingBGM === bgm.file && (
                                  <svg
                                    className="h-4 w-4 text-primary animate-pulse"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            {selectedBGM === bgm.file && (
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
                    {/* Hidden audio element for BGM preview */}
                    <audio
                      ref={bgmPreviewRef}
                      onEnded={handleBGMEnd}
                      className="hidden"
                    />
                  </div>

                  {/* Volume Control */}
                  {selectedBGM && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-card-foreground">
                          BGM Volume
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(bgmVolume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={bgmVolume}
                        onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}

                  {/* Mix Audio Button */}
                  {selectedBGM && (
                    <button
                      onClick={handleMixAudio}
                      disabled={isMixing || !audioUrl || !voiceOverId}
                      className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {isMixing ? (
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
                          Mixing Audio...
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
                              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                          </svg>
                          Mix with BGM
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

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

          {/* Audio Players */}
          {audioUrl && (
            <div className="space-y-4">
              {/* Original Voice-Over Audio */}
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
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
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

              {/* Mixed Audio with BGM */}
              {mixedAudioUrl && (
                <div className="rounded-xl border border-primary/50 bg-card p-6 shadow-lg ring-2 ring-primary/20">
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
                      Mixed Audio (Voice + BGM)
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
                        {bgmFiles.find(bgm => bgm.file === selectedBGM)?.name || 'BGM'}
                      </span>
                    </h3>
                    <button
                      onClick={() => {
                        if (!mixedAudioUrl) return
                        const link = document.createElement('a')
                        link.href = mixedAudioUrl
                        link.download = `${serviceName.replace(/\s+/g, '_')}_mixed_voiceover.wav`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }}
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
                      Download Mixed Audio
                    </button>
                  </div>
                  <audio
                    ref={mixedAudioRef}
                    src={mixedAudioUrl}
                    controls
                    className="w-full"
                  >
                    Your browser does not support the audio element.
                  </audio>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 This is the final audio with background music mixed at {Math.round(bgmVolume * 100)}% volume
                  </p>
                </div>
              )}

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

