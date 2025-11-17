import { useState } from 'react'
import type { ExtractResult } from './types'
import ReactMarkdown from 'react-markdown'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, XCircle, FileText, ExternalLink, AlertCircle } from 'lucide-react'

type ExtractResultsProps = {
  results: ExtractResult[]
  onBack: () => void
  onReset: () => void
  onAnalyze?: () => void
  loading?: boolean
  canAnalyze?: boolean
}

function getErrorType(error: string): { type: 'server' | 'client' | 'network' | 'unknown'; message: string } {
  if (error.includes('502') || error.includes('503') || error.includes('504')) {
    return { type: 'server', message: 'Server Error - The website is temporarily unavailable' }
  }
  if (error.includes('404') || error.includes('403') || error.includes('401')) {
    return { type: 'client', message: 'Page Not Found or Access Denied' }
  }
  if (error.includes('timeout') || error.includes('network') || error.includes('ECONNREFUSED')) {
    return { type: 'network', message: 'Network Error - Could not reach the website' }
  }
  return { type: 'unknown', message: error }
}

export function ExtractResults({ results, onBack, onReset, onAnalyze, loading = false, canAnalyze = false }: ExtractResultsProps) {
  const [selectedResult, setSelectedResult] = useState<ExtractResult | null>(null)
  
  const successCount = results.filter(r => !r.error && r.markdown).length
  const errorCount = results.filter(r => r.error).length

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Extraction Results
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="font-medium text-foreground">{successCount}</span> successful
              </span>
              {errorCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-foreground">{errorCount}</span> failed
                </span>
              )}
              <span className="text-muted-foreground">
                {results.length} total page{results.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onBack}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent hover:shadow-md"
            >
              Back
            </button>
            {canAnalyze && onAnalyze && (
              <button
                onClick={onAnalyze}
                disabled={loading}
                className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Offerings'
                )}
              </button>
            )}
            <button
              onClick={onReset}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent hover:shadow-md"
            >
              Start Over
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((result, index) => {
            const errorInfo = result.error ? getErrorType(result.error) : null
            
            return (
              <div
                key={index}
                onClick={() => setSelectedResult(result)}
                className={`group relative rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                  result.error
                    ? 'border-destructive/30 bg-destructive/5 hover:border-destructive/50 hover:shadow-lg'
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  {result.error ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20">
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                      <span className="text-xs font-medium text-destructive">Error</span>
                    </div>
                  ) : result.markdown ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-500">Success</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Empty</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {result.error ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-destructive/10 mt-0.5">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-destructive mb-1">
                            {errorInfo?.message || 'Extraction Failed'}
                          </h3>
                          <p className="text-xs text-muted-foreground break-all line-clamp-2 font-mono">
                            {result.url}
                          </p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-destructive/20">
                        <p className="text-xs text-destructive/80 font-mono line-clamp-2">
                          {result.error}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Title Section */}
                      <div className="space-y-2">
                        {result.metadata?.title ? (
                          <h3 className="text-lg font-semibold text-foreground line-clamp-2 leading-tight pr-16">
                            {result.metadata.title}
                          </h3>
                        ) : (
                          <h3 className="text-base font-medium text-primary break-all line-clamp-2 pr-16 font-mono text-sm">
                            {result.url}
                          </h3>
                        )}
                        
                        {result.metadata?.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {result.metadata.description}
                          </p>
                        )}
                      </div>
                      
                      {/* URL Display */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="break-all line-clamp-1 font-mono">
                          {result.url}
                        </span>
                      </div>
                      
                      {/* Footer Info */}
                      {result.markdown ? (
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-xs font-medium text-foreground">
                              {result.markdown.length.toLocaleString()} characters
                            </span>
                          </div>
                          <span className="text-xs text-primary font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            View content
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      ) : (
                        <div className="pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5" />
                            No content available
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Dialog open={selectedResult !== null} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="!max-w-[80vw] w-[70vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold break-words mb-2">
                  {selectedResult?.metadata?.title || selectedResult?.url}
                </DialogTitle>
                {selectedResult?.metadata?.description && (
                  <DialogDescription className="text-sm break-words mb-3">
                    {selectedResult.metadata.description}
                  </DialogDescription>
                )}
                {selectedResult?.url && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    <a
                      href={selectedResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-mono hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {selectedResult.url}
                    </a>
                  </div>
                )}
              </div>
              {selectedResult && !selectedResult.error && selectedResult.markdown && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0 mr-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-500">Extracted</span>
                </div>
              )}
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto mt-4 -mx-6 px-6">
            {selectedResult?.error ? (
              <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-destructive/10 flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-destructive text-lg">
                      {getErrorType(selectedResult.error).message}
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm font-mono text-destructive/80 break-all">
                        {selectedResult.error}
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">
                        This error occurred while attempting to scrape the page. The website may be temporarily unavailable, require authentication, or have blocked automated access.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedResult?.markdown ? (
              <div className="rounded-lg border border-border bg-background p-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-foreground [&_p]:mb-4 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-2 [&_li]:text-foreground [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:text-foreground [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-4 [&_pre]:border [&_pre]:border-border [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80 [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground [&_blockquote]:bg-muted/30 [&_blockquote]:py-2 [&_blockquote]:rounded-r">
                <ReactMarkdown>{selectedResult.markdown}</ReactMarkdown>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-medium">No content available for this URL.</p>
                <p className="text-xs text-muted-foreground mt-2">The page may be empty or the content could not be extracted.</p>
              </div>
            )}
          </div>
          
          {selectedResult?.markdown && (
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>
                  <span className="font-medium text-foreground">
                    {selectedResult.markdown.length.toLocaleString()}
                  </span>{' '}
                  characters scraped and saved
                </span>
              </div>
              <a
                href={selectedResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Open original page
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

