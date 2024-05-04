import { AutoCompleteInput } from '@renderer/components/common/AutoCompleteInput'
import { RichTextEditor } from '@renderer/components/common/RichTextEditor'
import { CreatePatientForm } from '@renderer/components/patient/NewPatientForm'
import { Button } from '@renderer/components/ui/button'
import { DatePicker } from '@renderer/components/ui/date-picker'
import { Input } from '@renderer/components/ui/input'
import { LucideArrowDown, Printer, Save, SearchIcon } from 'lucide-react'
import { useState } from 'react'

const SectionHeader = ({ title }: { title: string }) => (
  <div className="font-bold text-2xl">{title}</div>
)

export interface FormLabelProps extends React.HTMLProps<HTMLLabelElement> {
  children: React.ReactNode
}

export const AddNew = () => {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [surgery, setSurgery] = useState<string>('')

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

      <div>
        <section>
          <SectionHeader title="Patient Details" />

          {/* Patient Details */}
          <div className="flex flex-col mt-2">
            <div className="">
              <div className="flex flex-col w-full md:w-1/2">
                <div className="flex justify-center items-center space-x-1">
                  <Input
                    type="text"
                    id="phn_search"
                    placeholder="Lookup patient by PHN..."
                    className="w-full"
                  />

                  <Button variant={'secondary'} size={'sm'}>
                    <SearchIcon className="mr-1 w-5 h-5" />
                    Search
                  </Button>
                </div>
              </div>
            </div>

            <CreatePatientForm />
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
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="Surgery Title..."
                    className="w-full"
                    value={surgery}
                    onChange={(e) => setSurgery(e.target.value)}
                  />

                  <Button
                    size={'icon'}
                    variant={'ghost'}
                    className="ml-1"
                    onClick={() => {
                      setSurgery((old) => old + '↓')
                    }}
                  >
                    <LucideArrowDown className="w-6 h-6" />
                  </Button>
                </div>
              </div>
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

            <div className="flex flex-col">
              <label htmlFor="date" className="pb-1">
                Operation Date
              </label>
              <DatePicker label="Select Operation Date" onSelect={setDate} selected={date} />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex md:items-end md:space-x-2 md:w-full flex-col md:flex-row">
              <div className="flex flex-col w-full md:w-1/2">
                <label htmlFor="doctor" className="pb-1">
                  Done By
                </label>
                <AutoCompleteInput multiple={true} />
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
            <RichTextEditor initialContent={''} />
          </div>

          <div className="flex flex-col">
            <div className="font-semibold">Post Op Notes</div>
            <RichTextEditor initialContent={''} />
          </div>
        </section>
      </div>
    </div>
  )
}
