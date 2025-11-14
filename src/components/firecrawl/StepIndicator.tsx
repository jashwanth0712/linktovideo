type Step = 'branding' | 'map' | 'extract' | 'analyze' | 'pitch' | 'voiceover'

type StepIndicatorProps = {
  currentStep: Step
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps: Array<{ key: Step; label: string; number: number }> = [
    { key: 'branding', label: 'Branding', number: 1 },
    { key: 'map', label: 'Map', number: 2 },
    { key: 'extract', label: 'Extract', number: 3 },
    { key: 'analyze', label: 'Analyze', number: 4 },
    { key: 'pitch', label: 'Pitch', number: 5 },
    { key: 'voiceover', label: 'Voice-Over', number: 6 },
  ]

  const getStepStatus = (step: Step) => {
    const stepOrder = ['branding', 'map', 'extract', 'analyze', 'pitch', 'voiceover']
    const currentIndex = stepOrder.indexOf(currentStep)
    const stepIndex = stepOrder.indexOf(step.key)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  return (
    <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 pt-1">
      {steps.map((step, index) => {
        const status = getStepStatus(step)
        const isActive = status === 'active'
        const isCompleted = status === 'completed'
        
        return (
          <div key={step.key} className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-2 ${isActive ? 'text-foreground' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                  : isCompleted
                    ? 'bg-primary/80 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span className="font-medium whitespace-nowrap">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-px w-8 transition-colors ${
                isCompleted ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

