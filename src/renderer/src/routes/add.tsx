import { AutoCompleteInput } from '@renderer/components/common/AutoCompleteInput'
import { RichTextEditor } from '@renderer/components/common/RichTextEditor'
import { Button } from '@renderer/components/ui/button'
import { DatePicker } from '@renderer/components/ui/date-picker'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Printer, Save } from 'lucide-react'
import { useState } from 'react'

const SectionHeader = ({ title }: { title: string }) => (
  <div className="font-bold text-2xl">{title}</div>
)

export interface FormLabelProps extends React.HTMLProps<HTMLLabelElement> {
  children: React.ReactNode
}

export const AddNew = () => {
  const [date, setDate] = useState<Date | undefined>(undefined)

  return (
    <div className="flex flex-col h-full">
      <div className="text-center relative flex md:items-center md:justify-center">
        <h1 className="text-4xl font-bold">Add New Op Note</h1>

        <div className="absolute right-1 space-x-1">
          <Button className="" variant="default">
            <Save /> Save
          </Button>
          <Button className="" variant="secondary">
            <Printer /> Print
          </Button>
        </div>
      </div>

      <form onSubmit={() => {}}>
        <section>
          <SectionHeader title="Patient Details" />

          {/* Patient Details */}
          <div className="flex flex-col mt-2">
            <div className="md:flex flex-col md:flex-row items-center justify-center w-full md:space-x-2 md:items-end">
              <div className="flex flex-col w-full md:w-1/2">
                <label htmlFor="name" className="pb-1">
                  Name
                </label>
                <Input type="text" id="name" placeholder="Name of Patient" className="w-full" />
              </div>
              <div className="flex flex-col w-full md:w-1/3">
                <label htmlFor="age" className="pb-1">
                  Age
                </label>
                <Input type="text" placeholder="Age of Patient(eg: 25y, 1y 10m)" className="" />
              </div>

              <div className="flex flex-col">
                <label htmlFor="gender" className="pb-1">
                  Gender
                </label>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Gender..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="date" className="pb-1">
                  Date
                </label>
                <DatePicker label="Select Operation Date" onSelect={setDate} selected={date} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:space-x-2 w-full mt-1">
              <div className="flex flex-col w-full md:w-1/2">
                <label htmlFor="bht" className="pb-1">
                  BHT
                </label>
                <Input type="text" placeholder="BHT" className="w-full" />
              </div>

              <div className="flex flex-col w-full md:w-1/2">
                <label htmlFor="ward" className="pb-1">
                  Ward
                </label>
                <Input type="text" placeholder="Ward" />
              </div>
            </div>
          </div>
        </section>

        {/* Surgery Details */}
        <section className="mt-1">
          <SectionHeader title="Surgery Details" />

          <div className="flex flex-col mt-2">
            <div className="flex items-end space-x-2 w-full">
              <div className="flex flex-col w-full">
                <label htmlFor="surgery" className="pb-1">
                  Surgery
                </label>
                <Input type="text" placeholder="Surgery Title..." className="w-full" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex md:items-end md:space-x-2 md:w-full flex-col md:flex-row">
              <div className="flex flex-col w-full md:w-1/2">
                <label htmlFor="doctor" className="pb-1">
                  Done By
                </label>
                <AutoCompleteInput
                  items={[
                    {
                      value: '1',
                      label: 'Dr. John Doe'
                    },
                    {
                      value: '2',
                      label: 'Dr. William'
                    },
                    {
                      value: '3',
                      label: 'Dr. N Doe'
                    }
                  ]}
                />
              </div>

              <div className="flex flex-col w-full md:w-1/2 mt-1">
                <label htmlFor="assistant" className="pb-1">
                  Assisted By
                </label>
                <Input type="text" placeholder="Select or Add new entry..." />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="font-semibold">Notes</div>
            <RichTextEditor content={''} />
          </div>

          <div className="flex flex-col">
            <div className="font-semibold">Post Op Notes</div>
            <RichTextEditor content={''} />
          </div>
        </section>
      </form>
    </div>
  )
}
