type ColorPaletteProps = {
  colors: Record<string, string> | Array<{ hex?: string; rgb?: string; name?: string }>
}

export function ColorPalette({ colors }: ColorPaletteProps) {
  const hasColors = Array.isArray(colors)
    ? colors.length > 0
    : Object.keys(colors).length > 0

  if (!hasColors) return null

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 text-card-foreground">Color Palette</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.isArray(colors)
          ? colors.map((color, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 rounded-md border border-border bg-background p-4"
              >
                {color.hex && (
                  <div
                    className="w-full h-16 rounded-md border border-border"
                    style={{ backgroundColor: color.hex }}
                  />
                )}
                <div className="text-center w-full">
                  {color.name && (
                    <div className="text-xs font-medium text-card-foreground mb-1">{color.name}</div>
                  )}
                  {color.hex && (
                    <div className="text-xs font-mono text-muted-foreground">{color.hex}</div>
                  )}
                </div>
              </div>
            ))
          : Object.entries(colors).map(([name, hex], index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 rounded-md border border-border bg-background p-4"
              >
                {hex && (
                  <div
                    className="w-full h-16 rounded-md border border-border"
                    style={{ backgroundColor: hex }}
                  />
                )}
                <div className="text-center w-full">
                  <div className="text-xs font-medium text-card-foreground mb-1">{name}</div>
                  {hex && (
                    <div className="text-xs font-mono text-muted-foreground">{hex}</div>
                  )}
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}

