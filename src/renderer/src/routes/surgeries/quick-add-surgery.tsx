import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Patient } from 'src/shared/types/db'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { PatientLookup } from '@renderer/components/surgery/PatientLookup'
import { SelectedPatientSidebar } from '@renderer/components/surgery/SelectedPatientSidebar'
import {
  AddOrEditSurgery,
  AddOrEditSurgeryRef
} from '@renderer/components/surgery/AddOrEditSurgery'
import { NewPatientForm, NewPatientFormRef } from '@renderer/components/patient/NewPatientForm'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { queries } from '@renderer/lib/queries'
import { useKeyboardEvent } from '@renderer/hooks/useKeyboardEvent'
import { cn } from '@renderer/lib/utils'
import toast from 'react-hot-toast'
import {
  Stethoscope,
  Search,
  UserPlus,
  Save,
  ArrowLeft,
  ArrowRight,
  X
} from 'lucide-react'

type WizardStep = 'lookup' | 'create-patient' | 'surgery-form'

export function QuickAddSurgery() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [step, setStep] = useState<WizardStep>('lookup')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const surgeryFormRef = useRef<AddOrEditSurgeryRef>(null)
  const patientFormRef = useRef<NewPatientFormRef>(null)

  // Set breadcrumbs based on current step
  useEffect(() => {
    const crumbs = [{ label: 'Quick Add Surgery' }]
    if (step === 'create-patient') {
      crumbs.push({ label: 'Create Patient' })
    } else if (step === 'surgery-form' && selectedPatient) {
      crumbs.push({ label: selectedPatient.name })
    }
    setBreadcrumbs(crumbs)
  }, [setBreadcrumbs, step, selectedPatient])

  // Handle keyboard shortcut for save
  useKeyboardEvent({
    key: 's',
    ctrlKey: true,
    onKeyDown: () => {
      if (step === 'surgery-form') {
        surgeryFormRef.current?.submit()
      } else if (step === 'create-patient') {
        patientFormRef.current?.submit()
      }
    }
  })

  // Handle escape to go back
  useKeyboardEvent({
    key: 'Escape',
    onKeyDown: () => {
      if (step === 'create-patient') {
        setStep('lookup')
      } else if (step === 'surgery-form') {
        setStep('lookup')
        setSelectedPatient(null)
      }
    }
  })

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setStep('surgery-form')
  }

  const handleCreatePatient = () => {
    setStep('create-patient')
  }

  const handlePatientCreated = (patient: Patient) => {
    toast.success('Patient created successfully')
    setSelectedPatient(patient)
    setStep('surgery-form')
  }

  const handleChangePatient = () => {
    setStep('lookup')
    setSelectedPatient(null)
  }

  const handleSurgeryCreated = async (surgery: { id: number }) => {
    if (selectedPatient) {
      await queryClient.invalidateQueries({
        queryKey: queries.surgeries.list({ patient_id: selectedPatient.id }).queryKey
      })
      navigate(`/patients/${selectedPatient.id}/surgeries/${surgery.id}`)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'lookup':
        return 'Find Patient'
      case 'create-patient':
        return 'Create Patient'
      case 'surgery-form':
        return 'Surgery Details'
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 'lookup':
        return 'Search for an existing patient or create a new one'
      case 'create-patient':
        return 'Enter patient details to create a new record'
      case 'surgery-form':
        return `Recording surgery for ${selectedPatient?.name}`
    }
  }

  const getStepIcon = () => {
    switch (step) {
      case 'lookup':
        return Search
      case 'create-patient':
        return UserPlus
      case 'surgery-form':
        return Stethoscope
    }
  }

  const StepIcon = getStepIcon()

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <StepIcon className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{getStepTitle()}</h1>
            <p className="text-sm text-muted-foreground">{getStepDescription()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Back button for create-patient step */}
          {step === 'create-patient' && (
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => setStep('lookup')}
            >
              Back to Search
            </Button>
          )}
          {/* Save button for create-patient step */}
          {step === 'create-patient' && (
            <Button
              variant="gradient"
              leftIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => patientFormRef.current?.submit()}
            >
              Create & Continue
            </Button>
          )}
          {/* Save button for surgery-form step */}
          {step === 'surgery-form' && (
            <Button
              variant="gradient"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={() => surgeryFormRef.current?.submit()}
            >
              Save Surgery
            </Button>
          )}
          {/* Cancel button - always visible */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        {['lookup', 'surgery-form'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-border" />}
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                step === s || (s === 'lookup' && step === 'create-patient')
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : (step === 'surgery-form' && s === 'lookup')
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                  step === s || (s === 'lookup' && step === 'create-patient')
                    ? 'bg-emerald-500 text-white'
                    : (step === 'surgery-form' && s === 'lookup')
                      ? 'bg-white text-emerald-500'
                      : 'bg-muted-foreground/20 text-muted-foreground'
                )}
              >
                {step === 'surgery-form' && s === 'lookup' ? '✓' : i + 1}
              </span>
              <span>{s === 'lookup' ? 'Patient' : 'Surgery'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Step 1: Patient Lookup */}
        {step === 'lookup' && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <Card className="bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Search className="h-4 w-4 text-emerald-500" />
                  </div>
                  <CardTitle className="text-sm font-medium">
                    Patient Lookup
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <PatientLookup
                  onPatientSelect={handlePatientSelect}
                  onCreatePatient={handleCreatePatient}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 1b: Create Patient (inline) */}
        {step === 'create-patient' && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <NewPatientForm
              ref={patientFormRef}
              onRecordUpdated={handlePatientCreated}
            />
          </div>
        )}

        {/* Step 2: Surgery Form with Patient Sidebar */}
        {step === 'surgery-form' && selectedPatient && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in-up">
            {/* Patient Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <SelectedPatientSidebar
                patient={selectedPatient}
                onChangePatient={handleChangePatient}
              />
            </div>
            {/* Surgery Form */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <AddOrEditSurgery
                ref={surgeryFormRef}
                patientId={selectedPatient.id}
                onUpdated={handleSurgeryCreated}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
