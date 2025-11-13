import type { Link } from './types'

type MapStepProps = {
  mappedLinks: Link[]
  selectedUrls: Set<string>
  onUrlToggle: (url: string) => void
  onSelectAll: () => void
  onExtract: () => void
  onBack: () => void
  loading: boolean
}

export function MapStep({
  mappedLinks,
  selectedUrls,
  onUrlToggle,
  onSelectAll,
  onExtract,
  onBack,
  loading,
}: MapStepProps) {
  if (mappedLinks.length === 0) return null

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-card-foreground mb-1">
            Found {mappedLinks.length} Links
          </h2>
          <p className="text-sm text-muted-foreground">
            Select the pages you want to extract content from
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Back
          </button>
          <button
            onClick={onSelectAll}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {selectedUrls.size === mappedLinks.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={onExtract}
            disabled={loading || selectedUrls.size === 0}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Extracting...
              </span>
            ) : (
              `Extract (${selectedUrls.size})`
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto rounded-md border border-border bg-background p-4">
        {mappedLinks.map((link, index) => (
          <label
            key={index}
            className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-accent cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedUrls.has(link.url)}
              onChange={() => onUrlToggle(link.url)}
              className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-card-foreground mb-1 truncate">
                {link.title || link.url}
              </div>
              {link.description && (
                <div className="text-xs text-muted-foreground mb-1 line-clamp-2">
                  {link.description}
                </div>
              )}
              <div className="text-xs text-primary truncate">{link.url}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

