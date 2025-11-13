import type { BrandingData } from './types'
import { MetadataCard } from './MetadataCard'
import { BrandAssets } from './BrandAssets'
import { PersonalityCard } from './PersonalityCard'
import { ConfidenceScores } from './ConfidenceScores'
import { ColorPalette } from './ColorPalette'
import { TypographySection } from './TypographySection'

type BrandingResultsProps = {
  brandingData: BrandingData
  onProceed: () => void
  loading: boolean
}

export function BrandingResults({ brandingData, onProceed, loading }: BrandingResultsProps) {
  return (
    <div className="space-y-6">
      {brandingData.metadata && <MetadataCard metadata={brandingData.metadata} />}

      {brandingData.branding?.images && (
        <BrandAssets images={brandingData.branding.images} />
      )}

      {brandingData.branding?.personality && (
        <PersonalityCard personality={brandingData.branding.personality} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brandingData.branding?.colorScheme && (
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-card-foreground">Color Scheme</h2>
            <div className="rounded-md border border-border bg-background px-4 py-2">
              <span className="text-card-foreground capitalize">{brandingData.branding.colorScheme}</span>
            </div>
          </div>
        )}

        {brandingData.branding?.designSystem && (
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-card-foreground">Design System</h2>
            <div className="space-y-2">
              {brandingData.branding.designSystem.framework && (
                <div className="rounded-md border border-border bg-background px-4 py-2">
                  <span className="text-sm font-medium text-muted-foreground">Framework: </span>
                  <span className="text-card-foreground capitalize">{brandingData.branding.designSystem.framework}</span>
                </div>
              )}
              {brandingData.branding.designSystem.componentLibrary && (
                <div className="rounded-md border border-border bg-background px-4 py-2">
                  <span className="text-sm font-medium text-muted-foreground">Component Library: </span>
                  <span className="text-card-foreground">{brandingData.branding.designSystem.componentLibrary}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {brandingData.branding?.confidence && (
        <ConfidenceScores confidence={brandingData.branding.confidence} />
      )}

      {brandingData.branding?.colors && (
        <ColorPalette colors={brandingData.branding.colors} />
      )}

      {brandingData.branding?.fonts && (
        <TypographySection fonts={brandingData.branding.fonts} />
      )}

      <div className="flex justify-end">
        <button
          onClick={onProceed}
          disabled={loading}
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Mapping...
            </span>
          ) : (
            'Continue to Mapping'
          )}
        </button>
      </div>
    </div>
  )
}

