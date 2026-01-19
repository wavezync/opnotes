import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@renderer/components/ui/command'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  UserCog,
  Settings,
  Plus,
  User
} from 'lucide-react'
import { queries } from '@renderer/lib/queries'
import { useDebounce } from '@renderer/hooks/useDebounce'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 200)

  // Search patients when there's input
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    ...queries.patients.list({ search: debouncedSearch, pageSize: 5, page: 0 }),
    enabled: open && debouncedSearch.length > 1
  })

  // Search surgeries when there's input
  const { data: surgeries, isLoading: isLoadingSurgeries } = useQuery({
    ...queries.surgeries.list({ search: debouncedSearch, pageSize: 5, page: 0 }),
    enabled: open && debouncedSearch.length > 1
  })

  // Search doctors when there's input
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    ...queries.doctors.list({ search: debouncedSearch, pageSize: 5, page: 0 }),
    enabled: open && debouncedSearch.length > 1
  })

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch('')
    }
  }, [open])

  const runCommand = useCallback(
    (command: () => void) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange]
  )

  const hasSearchResults =
    debouncedSearch.length > 1 &&
    ((patients?.data?.length ?? 0) > 0 ||
      (surgeries?.data?.length ?? 0) > 0 ||
      (doctors?.data?.length ?? 0) > 0)

  const isSearching = isLoadingPatients || isLoadingSurgeries || isLoadingDoctors

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search patients, surgeries, doctors or type a command..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          {isSearching ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Searching...</span>
            </div>
          ) : (
            'No results found.'
          )}
        </CommandEmpty>

        {/* Search Results */}
        {hasSearchResults && (
          <>
            {/* Patients Results */}
            {(patients?.data?.length ?? 0) > 0 && (
              <CommandGroup heading="Patients">
                {patients?.data?.map((patient) => (
                  <CommandItem
                    key={`patient-${patient.id}`}
                    value={`patient ${patient.name} ${patient.phn}`}
                    onSelect={() => runCommand(() => navigate(`/patients/${patient.id}`))}
                  >
                    <User className="mr-2 h-4 w-4 text-blue-500" />
                    <div className="flex flex-col">
                      <span>{patient.name}</span>
                      <span className="text-xs text-muted-foreground">PHN: {patient.phn}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Surgeries Results */}
            {(surgeries?.data?.length ?? 0) > 0 && (
              <CommandGroup heading="Surgeries">
                {surgeries?.data?.map((surgery) => (
                  <CommandItem
                    key={`surgery-${surgery.id}`}
                    value={`surgery ${surgery.title} ${surgery.bht}`}
                    onSelect={() => runCommand(() => navigate(`/patients/${surgery.patient_id}/surgeries/${surgery.id}`))}
                  >
                    <Stethoscope className="mr-2 h-4 w-4 text-green-500" />
                    <div className="flex flex-col">
                      <span>{surgery.title}</span>
                      <span className="text-xs text-muted-foreground">BHT: {surgery.bht}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Doctors Results */}
            {(doctors?.data?.length ?? 0) > 0 && (
              <CommandGroup heading="Doctors">
                {doctors?.data?.map((doctor) => (
                  <CommandItem
                    key={`doctor-${doctor.id}`}
                    value={`doctor ${doctor.name} ${doctor.slmc_reg_no}`}
                    onSelect={() => runCommand(() => navigate(`/doctors/${doctor.id}/edit`))}
                  >
                    <UserCog className="mr-2 h-4 w-4 text-purple-500" />
                    <div className="flex flex-col">
                      <span>{doctor.name}</span>
                      <span className="text-xs text-muted-foreground">
                        SLMC: {doctor.slmc_reg_no}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />
          </>
        )}

        {/* Quick Actions - shown when no search or always at bottom */}
        {!hasSearchResults && (
          <>
            <CommandGroup heading="Quick Actions">
              <CommandItem onSelect={() => runCommand(() => navigate('/patients/add'))}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Add New Patient</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate('/quick-surgery'))}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Add New Surgery</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate('/doctors/add'))}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Add New Doctor</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate('/patients'))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Patients</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate('/surgeries'))}>
                <Stethoscope className="mr-2 h-4 w-4" />
                <span>Surgeries</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate('/doctors'))}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>Doctors</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
