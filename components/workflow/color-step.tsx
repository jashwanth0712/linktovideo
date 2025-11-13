"use client"

import { useState } from "react"
import { PlusIcon, TrashIcon, CopyIcon } from "@/lib/icons"

interface ColorStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function ColorStep({ data, onUpdate }: ColorStepProps) {
  const [colors, setColors] = useState<string[]>(data.colors || [])
  const [newColor, setNewColor] = useState("#000000")

  const handleAddColor = () => {
    if (newColor && !colors.includes(newColor)) {
      const updated = [...colors, newColor]
      setColors(updated)
      onUpdate({ ...data, colors: updated })
      setNewColor("#000000")
    }
  }

  const handleRemoveColor = (index: number) => {
    const updated = colors.filter((_, i) => i !== index)
    setColors(updated)
    onUpdate({ ...data, colors: updated })
  }

  const handleColorChange = (index: number, newColor: string) => {
    const updated = [...colors]
    updated[index] = newColor
    setColors(updated)
    onUpdate({ ...data, colors: updated })
  }

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color)
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
          <p className="text-sm text-muted-foreground">{data.url}</p>
        </div>
      </div>

      {/* Current Colors */}
      <div>
        <h4 className="font-semibold text-foreground mb-4">Brand Colors</h4>
        <div className="space-y-3">
          {colors.map((color, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border-2 border-border"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="w-full px-3 py-1 bg-background border border-border rounded text-sm text-foreground"
                  placeholder="#000000"
                />
              </div>
              <button
                onClick={() => handleCopyColor(color)}
                className="p-2 hover:bg-background rounded transition-colors text-muted-foreground"
              >
                <CopyIcon size={18} />
              </button>
              <button
                onClick={() => handleRemoveColor(index)}
                className="p-2 hover:bg-destructive/20 rounded transition-colors text-destructive"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Color */}
      <div className="flex gap-2">
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="w-12 h-12 rounded cursor-pointer border-2 border-border"
        />
        <input
          type="text"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground"
          placeholder="#000000"
        />
        <button
          onClick={handleAddColor}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <PlusIcon size={18} />
          Add
        </button>
      </div>
    </div>
  )
}
