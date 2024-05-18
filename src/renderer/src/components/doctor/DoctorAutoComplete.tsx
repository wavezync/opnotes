import { Doctor } from 'src/shared/types/db'
import { AutoCompleteInput } from '../common/AutoCompleteInput'
import { DoctorFilter } from 'src/shared/types/api'
import { queryOptions, useQueries, useQuery } from '@tanstack/react-query'
import { queries } from '../../lib/queries'
import { useState } from 'react'
import { Badge } from '../ui/badge'
import { X } from 'lucide-react'

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
    <span className="font-bold">{doctor.name}</span>
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
      {results.map((result, _i) => {
        const doctor = result.data
        if (!doctor) return null
        return (
          <div key={doctor.id} className="m-1">
            <Badge variant={'secondary'}>
              {doctor.name}
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
  const { data, isLoading } = useQuery(doctorsQuery({ pageSize: 100, search }))
  const doctors = data?.data || []
  const doctorItems = doctors.map((doctor) => ({
    value: `${doctor.id.toString()}`,
    label: <DoctorLabel doctor={doctor} />
  }))

  const handleDelete = (id: string) => {
    setSelected(selected.filter((s) => s !== id))
    onSelected?.(selected.filter((s) => s !== id))
  }

  return (
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
      />
      <div className="flex">
        <SelectedDoctorChips selectedDoctorIds={selected} onDelete={handleDelete} />
      </div>
    </div>
  )
}
