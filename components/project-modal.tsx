import type React from "react"
import { useState, useRef } from "react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { CloseIcon, LoaderIcon, ChevronLeftIcon, ChevronRightIcon } from "@/lib/icons"
import { ColorStep } from "./workflow/color-step"
import { LogoStep } from "./workflow/logo-step"
import { ProductsStep } from "./workflow/products-step"
import { ScriptStep } from "./workflow/script-step"

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (project: any) => void
}

export function ProjectModal({ isOpen, onClose, onSubmit }: ProjectModalProps) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [scrapedData, setScrapedData] = useState<any>(null)
  const [step, setStep] = useState<"input" | "colors" | "logo" | "products" | "script">("input")
  const [editedData, setEditedData] = useState<any>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const scrapeWebsite = useAction(api.scrape.scrapeWebsite)

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = await scrapeWebsite({ url })
      setScrapedData(data)
      setEditedData(data)
      setStep("colors")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleStepChange = (newStep: typeof step) => {
    setStep(newStep)
  }

  const handleConfirm = () => {
    if (editedData) {
      onSubmit(editedData)
      setUrl("")
      setScrapedData(null)
      setEditedData(null)
      setStep("input")
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  const stepTitles = {
    input: "Start New Project",
    colors: "Review Brand Colors",
    logo: "Select Logo",
    products: "Edit Products",
    script: "Generate Pitch Script",
  }

  if (!isOpen) return null

  return (
    <div
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-semibold text-foreground">{stepTitles[step]}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors">
            <CloseIcon size={20} className="text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "input" ? (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Website URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !url}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-muted disabled:text-muted-foreground text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <LoaderIcon size={18} />}
                {loading ? "Scraping..." : "Next"}
              </button>
            </form>
          ) : step === "colors" && editedData ? (
            <ColorStep data={editedData} onUpdate={setEditedData} />
          ) : step === "logo" && editedData ? (
            <LogoStep data={editedData} onUpdate={setEditedData} />
          ) : step === "products" && editedData ? (
            <ProductsStep data={editedData} onUpdate={setEditedData} />
          ) : step === "script" && editedData ? (
            <ScriptStep data={editedData} onUpdate={setEditedData} />
          ) : null}
        </div>

        {/* Footer Navigation */}
        {step !== "input" && (
          <div className="flex gap-3 p-6 border-t border-border flex-shrink-0">
            <button
              onClick={() => {
                if (step === "colors") {
                  setStep("input")
                  setScrapedData(null)
                  setEditedData(null)
                } else if (step === "logo") {
                  setStep("colors")
                } else if (step === "products") {
                  setStep("logo")
                } else if (step === "script") {
                  setStep("products")
                }
              }}
              className="flex-1 py-2 border border-border text-foreground hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeftIcon size={18} />
              Back
            </button>

            {step !== "script" && (
              <button
                onClick={() => {
                  if (step === "colors") setStep("logo")
                  else if (step === "logo") setStep("products")
                  else if (step === "products") setStep("script")
                }}
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Next
                <ChevronRightIcon size={18} />
              </button>
            )}

            {step === "script" && (
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
              >
                Confirm & Add to Masonry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
