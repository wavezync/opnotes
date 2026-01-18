import { useState, useRef } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Progress } from '@renderer/components/ui/progress'
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
import { WelcomeStep } from './steps/WelcomeStep'
import { HospitalInfoStep, HospitalInfoStepRef } from './steps/HospitalInfoStep'
import { TemplatesStep } from './steps/TemplatesStep'
import { QuickTipsStep } from './steps/QuickTipsStep'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queries } from '@renderer/lib/queries'
import { cn } from '@renderer/lib/utils'

const STEPS = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'hospital', title: 'Hospital Info' },
  { id: 'templates', title: 'Templates' },
  { id: 'tips', title: 'Quick Tips' }
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

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = async () => {
    // If on hospital step, validate and save first
    if (currentStep === 1 && hospitalInfoRef.current) {
      setIsSubmitting(true)
      const success = await hospitalInfoRef.current.submit()
      setIsSubmitting(false)
      if (!success) {
        return
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Last step - complete onboarding
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
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <div className="flex gap-1">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index < currentStep
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
          <X className="w-4 h-4 mr-1" />
          Skip Setup
        </Button>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8">{renderStep()}</div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t bg-muted/50">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isFirstStep}
          className={cn(isFirstStep && 'invisible')}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={isSubmitting || completeOnboardingMutation.isPending}
          isLoading={isSubmitting || completeOnboardingMutation.isPending}
          loadingText={isLastStep ? 'Finishing...' : 'Saving...'}
        >
          {isLastStep ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Get Started
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
