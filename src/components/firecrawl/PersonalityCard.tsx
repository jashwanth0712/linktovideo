type PersonalityCardProps = {
  personality: {
    energy?: string
    tone?: string
    targetAudience?: string
  }
}

export function PersonalityCard({ personality }: PersonalityCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 text-card-foreground">Personality</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {personality.energy && (
          <div className="rounded-md border border-border bg-background p-4">
            <span className="text-sm font-medium text-muted-foreground">Energy</span>
            <p className="mt-1 text-card-foreground capitalize">{personality.energy}</p>
          </div>
        )}
        {personality.tone && (
          <div className="rounded-md border border-border bg-background p-4">
            <span className="text-sm font-medium text-muted-foreground">Tone</span>
            <p className="mt-1 text-card-foreground capitalize">{personality.tone}</p>
          </div>
        )}
        {personality.targetAudience && (
          <div className="rounded-md border border-border bg-background p-4">
            <span className="text-sm font-medium text-muted-foreground">Target Audience</span>
            <p className="mt-1 text-card-foreground">{personality.targetAudience}</p>
          </div>
        )}
      </div>
    </div>
  )
}

