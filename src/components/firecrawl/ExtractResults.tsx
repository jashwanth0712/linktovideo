import type { ExtractResult } from './types'

type ExtractResultsProps = {
  results: ExtractResult[]
  onBack: () => void
  onReset: () => void
}

export function ExtractResults({ results, onBack, onReset }: ExtractResultsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-card-foreground mb-1">
            Extraction Results
          </h2>
          <p className="text-sm text-muted-foreground">
            {results.length} page{results.length !== 1 ? 's' : ''} processed
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
            onClick={onReset}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Start Over
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4 text-primary break-all">
              {result.url}
            </h3>

            {result.error ? (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{result.error}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {result.metadata && (
                  <div className="pb-4 border-b border-border">
                    {result.metadata.title && (
                      <h4 className="text-base font-semibold mb-2 text-card-foreground">
                        {result.metadata.title}
                      </h4>
                    )}
                    {result.metadata.description && (
                      <p className="text-sm text-muted-foreground">
                        {result.metadata.description}
                      </p>
                    )}
                  </div>
                )}

                {result.markdown ? (
                  <div>
                    <h4 className="text-base font-semibold mb-3 text-card-foreground">
                      Markdown Content
                    </h4>
                    <div className="rounded-md border border-border bg-background p-4">
                      <pre className="whitespace-pre-wrap text-sm font-mono text-card-foreground overflow-auto max-h-96">
                        {result.markdown}
                      </pre>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {result.markdown.length.toLocaleString()} characters scraped and saved
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border border-border bg-muted/50 p-4 text-muted-foreground">
                    No markdown content available for this URL.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

