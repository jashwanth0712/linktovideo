type Step = 'branding' | 'map' | 'extract'

type StepIndicatorProps = {
  currentStep: Step
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8 flex items-center gap-2">
      <div className={`flex items-center gap-2 ${currentStep === 'branding' ? 'text-foreground' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          currentStep === 'branding' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          1
        </div>
        <span className="font-medium">Branding</span>
      </div>
      <div className="h-px w-8 bg-border" />
      <div className={`flex items-center gap-2 ${currentStep === 'map' ? 'text-foreground' : currentStep === 'extract' ? 'text-foreground' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          currentStep === 'map' || currentStep === 'extract' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          2
        </div>
        <span className="font-medium">Map</span>
      </div>
      <div className="h-px w-8 bg-border" />
      <div className={`flex items-center gap-2 ${currentStep === 'extract' ? 'text-foreground' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          currentStep === 'extract' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          3
        </div>
        <span className="font-medium">Extract</span>
      </div>
    </div>
  )
}

