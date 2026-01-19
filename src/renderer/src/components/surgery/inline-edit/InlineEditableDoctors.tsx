import { cn } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { Check, Pencil, Save, X, Search, UserPlus } from 'lucide-react'
import { useState, useCallback, useMemo, useRef } from 'react'
import { DoctorModel } from '@shared/models/DoctorModel'
import { useQuery } from '@tanstack/react-query'
import { queries } from '@renderer/lib/queries'
import { Input } from '@renderer/components/ui/input'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Link } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@renderer/components/ui/sheet'
import { AddOrEditDoctor, AddOrEditDoctorRef } from '@renderer/components/doctor/AddOrEditDoctor'

export interface InlineEditableDoctorsProps {
  /** Currently assigned doctors */
  doctors: DoctorModel[] | undefined
  /** Called when doctors are saved */
  onSave: (doctorIds: number[]) => Promise<void>
  /** Placeholder for empty state */
  emptyPlaceholder?: string
  /** Label for the doctor type (e.g., "surgeons", "assistants") */
  doctorTypeLabel?: string
  /** Additional class name */
  className?: string
}

export const InlineEditableDoctors = ({
  doctors,
  onSave,
  emptyPlaceholder = 'No doctors assigned',
  doctorTypeLabel = 'doctors',
  className
}: InlineEditableDoctorsProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [addNewSheetOpen, setAddNewSheetOpen] = useState(false)
  const addDoctorFormRef = useRef<AddOrEditDoctorRef>(null)

  const isEmpty = !doctors || doctors.length === 0

  // Fetch all doctors for selection
  const { data: doctorList, refetch } = useQuery({
    ...queries.doctors.list({ pageSize: 100, search })
  })

  // Filter doctors based on search
  const filteredDoctors = useMemo(() => {
    const doctors = doctorList?.data || []
    if (!search.trim()) return doctors
    const searchLower = search.toLowerCase()
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(searchLower) ||
        d.designation?.toLowerCase().includes(searchLower)
    )
  }, [doctorList?.data, search])

  const handleOpen = useCallback(
    (open: boolean) => {
      if (open) {
        // Initialize selection with current doctors
        setSelectedIds(doctors?.map((d) => d.id) || [])
        setSearch('')
      }
      setIsOpen(open)
    },
    [doctors]
  )

  const handleToggleDoctor = useCallback((doctorId: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, doctorId] : prev.filter((id) => id !== doctorId)))
  }, [])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSave(selectedIds)
      setIsOpen(false)
    } finally {
      setIsSaving(false)
    }
  }, [selectedIds, onSave])

  const handleNewDoctor = useCallback(
    (doctor: DoctorModel) => {
      setSelectedIds((prev) => [...prev, doctor.id])
      setAddNewSheetOpen(false)
      refetch()
    },
    [refetch]
  )

  return (
    <>
      <Popover open={isOpen} onOpenChange={handleOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'group cursor-pointer transition-all duration-200 rounded-lg',
              'hover:bg-accent/30',
              className
            )}
            role="button"
            tabIndex={0}
          >
            {isEmpty ? (
              <div className="flex items-center gap-2 py-2 px-1 text-muted-foreground/60">
                <span className="text-sm">{emptyPlaceholder}</span>
                <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ) : (
              <div className="relative">
                <ul className="space-y-1.5 py-1">
                  {doctors.map((doctor) => (
                    <li key={doctor.id} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>
                        <Link
                          to={`/doctors/${doctor.id}/edit`}
                          className="hover:text-primary hover:underline transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Dr. {doctor.name}
                        </Link>
                        {doctor.designation && (
                          <span className="text-muted-foreground ml-1">({doctor.designation})</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                {/* Edit hint on hover */}
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm border text-xs text-muted-foreground">
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${doctorTypeLabel}...`}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="h-[240px]">
            <div className="p-2">
              {filteredDoctors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No {doctorTypeLabel} found
                </p>
              ) : (
                filteredDoctors.map((doctor) => (
                  <label
                    key={doctor.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedIds.includes(doctor.id)}
                      onCheckedChange={(checked) =>
                        handleToggleDoctor(doctor.id, checked as boolean)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Dr. {doctor.name}</p>
                      {doctor.designation && (
                        <p className="text-xs text-muted-foreground truncate">
                          {doctor.designation}
                        </p>
                      )}
                    </div>
                    {selectedIds.includes(doctor.id) && (
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    )}
                  </label>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="p-2 border-t bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setAddNewSheetOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add new doctor
            </Button>
          </div>

          <div className="flex items-center justify-end gap-2 p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Add new doctor sheet */}
      <Sheet open={addNewSheetOpen} onOpenChange={setAddNewSheetOpen}>
        <SheetContent className="sm:max-w-none w-[480px] flex flex-col">
          <SheetHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <SheetTitle className="text-lg">Add New Doctor</SheetTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Add a new doctor to the system
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 py-4">
            <AddOrEditDoctor ref={addDoctorFormRef} onUpdated={handleNewDoctor} />
          </div>

          <SheetFooter className="pt-4 border-t">
            <Button
              variant="gradient"
              onClick={() => {
                addDoctorFormRef.current?.submit()
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Doctor
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
