type BrandAssetsProps = {
  images: {
    logo?: string
    favicon?: string
    ogImage?: string
  }
}

export function BrandAssets({ images }: BrandAssetsProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 text-card-foreground">Brand Assets</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {images.logo && (
          <div className="rounded-md border border-border bg-background p-4">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Logo</h3>
            <div className="flex flex-col items-center gap-3">
              <img
                src={images.logo}
                alt="Logo"
                className="max-w-full h-24 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <a
                href={images.logo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline break-all text-center"
              >
                {images.logo}
              </a>
            </div>
          </div>
        )}
        {images.favicon && (
          <div className="rounded-md border border-border bg-background p-4">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Favicon</h3>
            <div className="flex flex-col items-center gap-3">
              <img
                src={images.favicon}
                alt="Favicon"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <a
                href={images.favicon}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline break-all text-center"
              >
                {images.favicon}
              </a>
            </div>
          </div>
        )}
        {images.ogImage && (
          <div className="rounded-md border border-border bg-background p-4">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">OG Image</h3>
            <div className="flex flex-col items-center gap-3">
              <img
                src={images.ogImage}
                alt="OG Image"
                className="max-w-full h-24 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <a
                href={images.ogImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline break-all text-center"
              >
                {images.ogImage}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

