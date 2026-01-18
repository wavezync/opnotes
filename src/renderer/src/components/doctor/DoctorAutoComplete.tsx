import { Doctor } from 'src/shared/types/db'
import { AutoCompleteInput } from '../common/AutoCompleteInput'
import { DoctorFilter } from 'src/shared/types/api'
import { queryOptions, useQueries, useQuery } from '@tanstack/react-query'
import { queries } from '../../lib/queries'
import { useCallback, useRef, useState } from 'react'
import { Badge } from '../ui/badge'
import { X, UserPlus, Save } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '../ui/sheet'
import { Button } from '../ui/button'
import { AddOrEditDoctor, AddOrEditDoctorRef } from './AddOrEditDoctor'
import { DoctorModel } from '@shared/models/DoctorModel'

const doctorsQuery = (doctorFilter: DoctorFilter) =>
  queryOptions({
    ...queries.doctors.list(doctorFilter)
  })

const doctorByIdQuery = (id: number) =>
  queryOptions({
    ...queries.doctors.get(id)
  })

export interface DoctorAutoCompleteProps {
  onSelected?: (doctorIds: string[]) => void
  selectedDoctorIds?: string[]
}

const DoctorLabel = ({ doctor }: { doctor: Doctor }) => (
  <div className="flex flex-col">
    <span className="font-bold">Dr. {doctor.name}</span>
    <span className="italic">{doctor.designation}</span>
  </div>
)

const SelectedDoctorChips = ({
  selectedDoctorIds,
  onDelete
}: {
  selectedDoctorIds: string[]
  onDelete?: (id: string) => void
}) => {
  const results = useQueries({
    queries: selectedDoctorIds.map((id) => doctorByIdQuery(parseInt(id)))
  })

  return (
    <div className="flex flex-wrap">
      {results.map((result) => {
        const doctor = result.data
        if (!doctor) return null
        return (
          <div key={doctor.id} className="m-1">
            <Badge variant={'secondary'}>
              Dr. {doctor.name}
              {doctor.designation && <>({doctor.designation})</>}
              <button
                className="hover:text-destructive transition-all group"
                onClick={() => {
                  onDelete?.(doctor.id.toString())
                }}
              >
                <X className="w-4 h-4 fill-current group-hover:-scale-125" />
              </button>
            </Badge>
          </div>
        )
      })}
    </div>
  )
}

export const DoctorAutoComplete = ({ onSelected, selectedDoctorIds }: DoctorAutoCompleteProps) => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([...(selectedDoctorIds || [])])
  const { data, isLoading, refetch } = useQuery(doctorsQuery({ pageSize: 100, search }))
  const doctors = data?.data || []
  const doctorItems = doctors.map((doctor) => ({
    value: `${doctor.id.toString()}`,
    label: <DoctorLabel doctor={doctor} />
  }))
  const addDoctorFormRef = useRef<AddOrEditDoctorRef>(null)
  const [addNewSheetOpen, setAddNewSheetOpen] = useState(false)

  const handleDelete = useCallback(
    (id: string) => {
      setSelected(selected.filter((s) => s !== id))
      onSelected?.(selected.filter((s) => s !== id))
    },
    [onSelected, selected]
  )

  const handleNewDoctor = useCallback(
    (doctor: DoctorModel) => {
      setSelected([...selected, doctor.id.toString()])
      onSelected?.([...selected, doctor.id.toString()])
      setAddNewSheetOpen(false)
      refetch()
    },
    [onSelected, refetch, selected]
  )

  return (
    <>
      <div className="flex flex-col justify-start items-start">
        <AutoCompleteInput
          multiple
          placeholder="Search Doctors..."
          onSelectedValuesChange={(values) => {
            setSelected(values)
            onSelected?.(values)
          }}
          selectedValues={selected}
          onSearchChange={setSearch}
          items={doctorItems}
          isLoading={isLoading}
          onAddNewItem={() => setAddNewSheetOpen(true)}
        />
        <div className="flex">
          <SelectedDoctorChips selectedDoctorIds={selected} onDelete={handleDelete} />
        </div>
      </div>
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
