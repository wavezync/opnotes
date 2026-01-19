import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { queries } from '@renderer/lib/queries'
import { useDebounce } from '@renderer/hooks/useDebounce'
import { Input } from '@renderer/components/ui/input'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { PatientResultCard } from './PatientResultCard'
import { Patient } from 'src/shared/types/db'
import { Search, UserPlus, Users } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/lib/utils'

interface PatientLookupProps {
  onPatientSelect: (patient: Patient) => void
  onCreatePatient: () => void
  className?: string
}

export function PatientLookup({
  onPatientSelect,
  onCreatePatient,
  className
}: PatientLookupProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 200)

  const { data: patients, isLoading } = useQuery({
    ...queries.patients.list({ search: debouncedSearch, pageSize: 10, page: 0 }),
    enabled: debouncedSearch.length > 0
  })

  const hasResults = (patients?.data?.length ?? 0) > 0
  const showResults = debouncedSearch.length > 0

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search by PHN, BHT, or patient name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-14 text-lg bg-card border-2 focus:border-emerald-500 transition-colors"
          autoFocus
        />
      </div>

      {/* Results Area */}
      <div className="min-h-[300px]">
        {/* Loading State */}
        {isLoading && debouncedSearch.length > 0 && (
          <div className="space-y-3 animate-fade-in-up">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl border bg-card"
              >
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results List */}
        {!isLoading && showResults && hasResults && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {patients?.total ?? 0} patient{(patients?.total ?? 0) !== 1 ? 's' : ''} found
              </span>
            </div>
            <div className="space-y-2">
              {patients?.data?.map((patient, index) => (
                <PatientResultCard
                  key={patient.id}
                  patient={patient}
                  onSelect={onPatientSelect}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && showResults && !hasResults && (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in-up">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No patients found</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
              No patients match &ldquo;{debouncedSearch}&rdquo;. Create a new patient to continue.
            </p>
            <Button
              variant="gradient"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={onCreatePatient}
            >
              Create New Patient
            </Button>
          </div>
        )}

        {/* Empty State - Before Search */}
        {!showResults && (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in-up">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Search for a patient</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Enter the patient&apos;s PHN, BHT number, or name to find their record
            </p>

            {/* Divider with "or" */}
            <div className="flex items-center gap-3 w-full max-w-xs my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Create New Patient Button */}
            <button
              type="button"
              onClick={onCreatePatient}
              className="group rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-200 p-6 w-full max-w-xs"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-11 w-11 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">
                    Create New Patient
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add a new patient record
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Create Patient Option - Always visible when there are results */}
      {showResults && hasResults && (
        <div className="border-t pt-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <button
            type="button"
            onClick={onCreatePatient}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-emerald-500" />
            </div>
            <span>Can&apos;t find the patient? <strong className="text-foreground">Create a new one</strong></span>
          </button>
        </div>
      )}
    </div>
  )
}
