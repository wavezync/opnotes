import { useState, useRef } from 'react'
import { Button } from '@renderer/components/ui/button'
import { ChevronRight, X, Check, Rocket, Building2, FileText, Lightbulb } from 'lucide-react'
import { WelcomeStep } from './steps/WelcomeStep'
import opNotesLogo from '@renderer/assets/opnotes-logo.png'
import { HospitalInfoStep, HospitalInfoStepRef } from './steps/HospitalInfoStep'
import { TemplatesStep } from './steps/TemplatesStep'
import { QuickTipsStep } from './steps/QuickTipsStep'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queries } from '@renderer/lib/queries'
import { cn } from '@renderer/lib/utils'

const STEPS = [
  { id: 'welcome', title: 'Welcome', subtitle: 'Get started', icon: Rocket },
  { id: 'hospital', title: 'Hospital', subtitle: 'Your details', icon: Building2 },
  { id: 'templates', title: 'Templates', subtitle: 'Save time', icon: FileText },
  { id: 'tips', title: 'Quick Tips', subtitle: 'Pro features', icon: Lightbulb }
] as const

interface OnboardingWizardProps {
  onComplete: () => void
}

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hospitalInfoRef = useRef<HospitalInfoStepRef>(null)
  const queryClient = useQueryClient()

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      await window.api.invoke('updateSettings', [{ key: 'onboarding_completed', value: 'true' }])
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(queries.app.settings)
      onComplete()
    }
  })

  const handleNext = async () => {
    if (currentStep === 1 && hospitalInfoRef.current) {
      setIsSubmitting(true)
      const success = await hospitalInfoRef.current.submit()
      setIsSubmitting(false)
      if (!success) return
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboardingMutation.mutate()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    completeOnboardingMutation.mutate()
  }

  const isLastStep = currentStep === STEPS.length - 1
  const isFirstStep = currentStep === 0

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />
      case 1:
        return <HospitalInfoStep ref={hospitalInfoRef} />
      case 2:
        return <TemplatesStep />
      case 3:
        return <QuickTipsStep />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-background">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
            top: '-10%',
            right: '-10%',
            opacity: 0.07,
            filter: 'blur(80px)'
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
            bottom: '-15%',
            left: '20%',
            opacity: 0.05,
            filter: 'blur(60px)',
            animationDelay: '-3s'
          }}
        />
      </div>

      {/* Left Sidebar - Step Navigation */}
      <aside className="relative w-72 flex-shrink-0 bg-card/50 backdrop-blur-sm border-r border-border/50 flex flex-col">
        {/* Logo area */}
        <div className="p-6 pb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-card border border-border/50 shadow-theme-sm flex items-center justify-center">
              <img src={opNotesLogo} alt="Op Notes" className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Op Notes</h1>
              <p className="text-xs text-muted-foreground">Setup Wizard</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <nav className="flex-1 px-4">
          <div className="space-y-1">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <div key={step.id} className="relative">
                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-[23px] top-[52px] w-0.5 h-6 transition-colors duration-500',
                        index < currentStep ? 'bg-primary' : 'bg-border'
                      )}
                    />
                  )}

                  <button
                    onClick={() => index < currentStep && setCurrentStep(index)}
                    disabled={index > currentStep}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300',
                      'text-left group',
                      isActive && 'bg-primary/10',
                      isCompleted && 'cursor-pointer hover:bg-muted/50',
                      !isActive && !isCompleted && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {/* Step indicator */}
                    <div
                      className={cn(
                        'relative h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300',
                        isActive && 'bg-gradient-primary shadow-theme-primary',
                        isCompleted && 'bg-primary/20',
                        !isActive && !isCompleted && 'bg-muted border border-border'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Icon
                          className={cn(
                            'h-4 w-4 transition-colors',
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                          )}
                        />
                      )}
                      {/* Active pulse */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-xl bg-primary/30 animate-ping" />
                      )}
                    </div>

                    {/* Step text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium transition-colors',
                          isActive ? 'text-foreground' : 'text-muted-foreground',
                          isCompleted && 'text-foreground'
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{step.subtitle}</p>
                    </div>

                    {/* Step number badge */}
                    <span
                      className={cn(
                        'text-xs font-medium tabular-nums px-2 py-0.5 rounded-full',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : isCompleted
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {index + 1}
                    </span>
                  </button>
                </div>
              )
            })}
          </div>
        </nav>

        {/* Skip button */}
        <div className="p-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Skip Setup
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Progress indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-8">
            <div className="w-full max-w-xl animate-fade-in-up" key={currentStep}>
              {renderStep()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between p-6 border-t border-border/50 bg-card/30 backdrop-blur-sm">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={isFirstStep}
            className={cn(
              'gap-2 transition-all duration-300',
              isFirstStep && 'opacity-0 pointer-events-none'
            )}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  index === currentStep
                    ? 'w-6 bg-primary'
                    : index < currentStep
                      ? 'w-1.5 bg-primary/50'
                      : 'w-1.5 bg-muted'
                )}
              />
            ))}
          </div>

          <Button
            variant="gradient"
            onClick={handleNext}
            disabled={isSubmitting || completeOnboardingMutation.isPending}
            isLoading={isSubmitting || completeOnboardingMutation.isPending}
            loadingText={isLastStep ? 'Finishing...' : 'Saving...'}
            className="gap-2 min-w-[140px]"
          >
            {isLastStep ? (
              <>
                <Check className="w-4 h-4" />
                Get Started
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </footer>
      </main>
    </div>
  )
}
