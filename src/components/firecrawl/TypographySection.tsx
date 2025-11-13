type TypographySectionProps = {
  fonts: Array<{ family?: string; size?: string; weight?: string }> | Record<string, any>
}

export function TypographySection({ fonts }: TypographySectionProps) {
  const hasFonts = Array.isArray(fonts)
    ? fonts.length > 0
    : Object.keys(fonts).length > 0

  if (!hasFonts) return null

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 text-card-foreground">Typography</h2>
      <div className="space-y-3">
        {Array.isArray(fonts)
          ? fonts.map(
              (
                font: {
                  family?: string
                  size?: string
                  weight?: string
                },
                index: number,
              ) => (
                <div
                  key={index}
                  className="rounded-md border border-border bg-background p-4"
                  style={{
                    fontFamily: font.family || 'inherit',
                    fontSize: font.size || 'inherit',
                    fontWeight: font.weight || 'inherit',
                  }}
                >
                  <div className="text-sm text-muted-foreground mb-2">
                    {font.family && <span className="font-medium">Family: </span>}
                    {font.family || 'Default'}
                    {font.size && (
                      <>
                        {' • '}
                        <span className="font-medium">Size: </span>
                        {font.size}
                      </>
                    )}
                    {font.weight && (
                      <>
                        {' • '}
                        <span className="font-medium">Weight: </span>
                        {font.weight}
                      </>
                    )}
                  </div>
                  <div className="text-lg text-card-foreground">
                    The quick brown fox jumps over the lazy dog
                  </div>
                </div>
              ),
            )
          : (
              <div className="rounded-md border border-border bg-background p-4">
                <pre className="text-xs font-mono text-card-foreground overflow-auto">
                  {JSON.stringify(fonts, null, 2)}
                </pre>
              </div>
            )}
      </div>
    </div>
  )
}

