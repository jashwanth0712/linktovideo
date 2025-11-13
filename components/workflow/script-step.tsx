"use client"

import { useState } from "react"
import { VolumeIcon, TrashIcon, PlusIcon } from "@/lib/icons"

interface ScriptLine {
  id: string
  text: string
}

interface ScriptStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function ScriptStep({ data, onUpdate }: ScriptStepProps) {
  const [script, setScript] = useState<ScriptLine[]>(
    data.script || [
      {
        id: "1",
        text: `Introducing ${data.name}, a revolutionary platform that transforms the way businesses operate.`,
      },
      { id: "2", text: "With cutting-edge technology and user-friendly design, we deliver exceptional value." },
      {
        id: "3",
        text: `Our ${data.products?.length || 0} premium products and services cater to every need.`,
      },
      { id: "4", text: "Join thousands of satisfied customers who trust us for excellence." },
      { id: "5", text: "Experience the difference today." },
    ],
  )
  const [selectedVoice, setSelectedVoice] = useState("alloy")
  const [playingId, setPlayingId] = useState<string | null>(null)

  const voiceOptions = [
    { id: "alloy", name: "Alloy (Professional)" },
    { id: "echo", name: "Echo (Warm)" },
    { id: "fable", name: "Fable (Dynamic)" },
    { id: "onyx", name: "Onyx (Deep)" },
    { id: "nova", name: "Nova (Bright)" },
    { id: "shimmer", name: "Shimmer (Smooth)" },
  ]

  const handleUpdateScript = (id: string, text: string) => {
    const updated = script.map((line) => (line.id === id ? { ...line, text } : line))
    setScript(updated)
    onUpdate({ ...data, script: updated })
  }

  const handleRemoveScript = (id: string) => {
    const updated = script.filter((line) => line.id !== id)
    setScript(updated)
    onUpdate({ ...data, script: updated })
  }

  const handleAddScript = () => {
    const newLine: ScriptLine = {
      id: Date.now().toString(),
      text: "New script line",
    }
    const updated = [...script, newLine]
    setScript(updated)
    onUpdate({ ...data, script: updated })
  }

  const handlePlayAudio = async (id: string, text: string) => {
    setPlayingId(id)
    // Simulate TTS - in production, this would call an API
    console.log(`[v0] Playing audio for: "${text}" with voice: ${selectedVoice}`)
    setTimeout(() => setPlayingId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Website Info */}
      <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
        {data.logo && (
          <img
            src={data.logo || "/placeholder.svg"}
            alt="Logo"
            className="w-16 h-16 rounded-lg bg-background object-cover"
          />
        )}
        <div>
          <h3 className="font-semibold text-foreground">{data.name}</h3>
          <p className="text-sm text-muted-foreground">Voice-over pitch script</p>
        </div>
      </div>

      {/* Voice Selection */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Select Voice</h4>
        <div className="grid grid-cols-2 gap-2">
          {voiceOptions.map((voice) => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                selectedVoice === voice.id
                  ? "border-blue-500 bg-blue-500/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {voice.name}
            </button>
          ))}
        </div>
      </div>

      {/* Script Lines */}
      <div>
        <h4 className="font-semibold text-foreground mb-4">Pitch Script</h4>
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {script.map((line) => (
            <div key={line.id} className="flex gap-2 p-3 bg-muted rounded-lg">
              <button
                onClick={() => handlePlayAudio(line.id, line.text)}
                className={`p-2 rounded transition-colors flex-shrink-0 ${
                  playingId === line.id ? "bg-blue-500 text-white" : "hover:bg-background text-muted-foreground"
                }`}
                title="Play audio preview"
              >
                <VolumeIcon size={18} />
              </button>

              <textarea
                value={line.text}
                onChange={(e) => handleUpdateScript(line.id, e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground resize-none"
                rows={2}
              />

              <button
                onClick={() => handleRemoveScript(line.id)}
                className="p-2 hover:bg-destructive/20 rounded transition-colors text-destructive flex-shrink-0"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Script Line Button */}
      <button
        onClick={handleAddScript}
        className="w-full py-3 border-2 border-dashed border-border hover:border-foreground/30 rounded-lg text-foreground transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <PlusIcon size={18} />
        Add Script Line
      </button>

      {/* Preview */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Full Script Preview</p>
        <p className="text-sm text-foreground leading-relaxed">{script.map((line) => line.text).join(" ")}</p>
      </div>
    </div>
  )
}
