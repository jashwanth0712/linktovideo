type ConfidenceScoresProps = {
  confidence: {
    overall?: number
    colors?: number
    buttons?: number
  }
}

export function ConfidenceScores({ confidence }: ConfidenceScoresProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 text-card-foreground">Confidence Scores</h2>
      <div className="space-y-4">
        {confidence.overall !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-card-foreground">Overall</span>
              <span className="text-sm text-muted-foreground">{(confidence.overall * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${confidence.overall * 100}%` }}
              />
            </div>
          </div>
        )}
        {confidence.colors !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-card-foreground">Colors</span>
              <span className="text-sm text-muted-foreground">{(confidence.colors * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-chart-2 rounded-full transition-all duration-300"
                style={{ width: `${confidence.colors * 100}%` }}
              />
            </div>
          </div>
        )}
        {confidence.buttons !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-card-foreground">Buttons</span>
              <span className="text-sm text-muted-foreground">{(confidence.buttons * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-chart-3 rounded-full transition-all duration-300"
                style={{ width: `${confidence.buttons * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

