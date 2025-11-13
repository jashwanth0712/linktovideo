"use client"

import { useState } from "react"

interface LogoStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function LogoStep({ data, onUpdate }: LogoStepProps) {
  const [selectedLogo, setSelectedLogo] = useState(data.logo)
  const [logoOptions] = useState([
    data.logo,
    `/placeholder.svg?height=200&width=200&query=logo`,
    `/placeholder.svg?height=200&width=200&query=brand icon`,
    `/placeholder.svg?height=200&width=200&query=company emblem`,
  ])
  const [customUrl, setCustomUrl] = useState("")

  const handleSelectLogo = (logo: string) => {
    setSelectedLogo(logo)
    onUpdate({ ...data, logo })
  }

  const handleCustomUrl = () => {
    if (customUrl) {
      handleSelectLogo(customUrl)
      setCustomUrl("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Website Info */}
      <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
        {selectedLogo && (
          <img
            src={selectedLogo || "/placeholder.svg"}
            alt="Logo"
            className="w-16 h-16 rounded-lg bg-background object-cover"
          />
        )}
        <div>
          <h3 className="font-semibold text-foreground">{data.name}</h3>
          <p className="text-sm text-muted-foreground">{data.url}</p>
        </div>
      </div>

      {/* Logo Options */}
      <div>
        <h4 className="font-semibold text-foreground mb-4">Select or Upload Logo</h4>
        <div className="grid grid-cols-2 gap-4">
          {logoOptions.map((logo, index) => (
            <button
              key={index}
              onClick={() => handleSelectLogo(logo)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedLogo === logo ? "border-blue-500 bg-blue-500/10" : "border-border hover:border-foreground/30"
              }`}
            >
              <img
                src={logo || "/placeholder.svg"}
                alt={`Logo option ${index + 1}`}
                className="w-full h-24 object-cover rounded"
              />
              <p className="text-xs text-muted-foreground mt-2">Option {index + 1}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom URL */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Or paste a custom URL</h4>
        <div className="flex gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm"
          />
          <button
            onClick={handleCustomUrl}
            disabled={!customUrl}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-muted disabled:text-muted-foreground text-white rounded-lg transition-colors text-sm font-medium"
          >
            Use
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground mb-3">Preview</p>
        {selectedLogo && (
          <img
            src={selectedLogo || "/placeholder.svg"}
            alt="Selected logo preview"
            className="w-32 h-32 rounded-lg bg-background object-cover"
          />
        )}
      </div>
    </div>
  )
}
