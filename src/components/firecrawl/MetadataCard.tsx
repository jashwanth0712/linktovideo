type MetadataCardProps = {
  metadata: {
    title?: string
    description?: string
    sourceURL?: string
  }
}

export function MetadataCard({ metadata }: MetadataCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 text-card-foreground">Page Information</h2>
      <div className="space-y-3">
        {metadata.title && (
          <div>
            <span className="text-sm font-medium text-muted-foreground">Title</span>
            <p className="mt-1 text-card-foreground">{metadata.title}</p>
          </div>
        )}
        {metadata.description && (
          <div>
            <span className="text-sm font-medium text-muted-foreground">Description</span>
            <p className="mt-1 text-card-foreground">{metadata.description}</p>
          </div>
        )}
        {metadata.sourceURL && (
          <div>
            <span className="text-sm font-medium text-muted-foreground">Source URL</span>
            <a
              href={metadata.sourceURL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-primary hover:underline break-all"
            >
              {metadata.sourceURL}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

