import { useState } from 'react'
import type { Offering } from './types'

type AnalyzeOfferingsProps = {
  offerings: Offering[]
  loading: boolean
  onBack: () => void
  onReset: () => void
  onProceed: (selectedService: Offering | null) => void
}

export function AnalyzeOfferings({
  offerings,
  loading,
  onBack,
  onReset,
  onProceed,
}: AnalyzeOfferingsProps) {
  const [selectedService, setSelectedService] = useState<Offering | null>(null)
  const products = offerings.filter((o) => o.type === 'product')
  const services = offerings.filter((o) => o.type === 'service')

  const handleServiceClick = (service: Offering) => {
    if (selectedService?.name === service.name) {
      setSelectedService(null)
    } else {
      setSelectedService(service)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-card-foreground mb-1">
            Analyzed Offerings
          </h2>
          <p className="text-sm text-muted-foreground">
            {offerings.length} offering{offerings.length !== 1 ? 's' : ''} found
            {products.length > 0 && ` • ${products.length} product${products.length !== 1 ? 's' : ''}`}
            {services.length > 0 && ` • ${services.length} service${services.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Back
          </button>
          {services.length > 0 && (
            <button
              onClick={() => onProceed(selectedService)}
              disabled={!selectedService}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Next Step →
            </button>
          )}
          <button
            onClick={onReset}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Start Over
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-card p-12 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-4">
            <svg
              className="h-8 w-8 animate-spin text-primary"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-muted-foreground">
              Analyzing content and extracting offerings...
            </p>
          </div>
        </div>
      ) : offerings.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-muted-foreground text-center">
            No offerings found. Try analyzing more content.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {products.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-card-foreground">
                Products ({products.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="rounded-full bg-primary/10 p-2">
                        <svg
                          className="h-4 w-4 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-card-foreground mb-2">
                          {product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {services.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-card-foreground">
                  Services ({services.length})
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedService
                    ? `Selected: ${selectedService.name}`
                    : 'Select a service to generate pitch'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service, index) => {
                  const isSelected = selectedService?.name === service.name
                  return (
                    <div
                      key={index}
                      onClick={() => handleServiceClick(service)}
                      className={`rounded-lg border p-6 shadow-sm cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                          : 'border-border bg-card hover:border-primary/50 hover:bg-accent/30'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div
                          className={`rounded-full p-2 transition-colors ${
                            isSelected
                              ? 'bg-primary/20 text-primary'
                              : 'bg-chart-2/10 text-chart-2'
                          }`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-semibold text-card-foreground">
                              {service.name}
                            </h4>
                            {isSelected && (
                              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
