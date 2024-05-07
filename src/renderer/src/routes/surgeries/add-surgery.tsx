import { AutoCompleteInput } from '@renderer/components/common/AutoCompleteInput'
import { RichTextEditor } from '@renderer/components/common/RichTextEditor'
import { Button } from '@renderer/components/ui/button'
import { DatePicker } from '@renderer/components/ui/date-picker'
import { Input } from '@renderer/components/ui/input'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { LucideArrowDown, Printer, Save } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface FormLabelProps extends React.HTMLProps<HTMLLabelElement> {
  children: React.ReactNode
}

export const AddNewSurgery = () => {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [surgery, setSurgery] = useState<string>('')
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([{ label: 'Surgery', to: '/surgeries' }, { label: 'Add Surgery' }])
  }, [setBreadcrumbs])

  const actions = (
    <>
      <Button className="" variant="default">
        <Save /> Save
      </Button>
      <Button className="" variant="secondary">
        <Printer /> Print
      </Button>
    </>
  )

  return (
    <AppLayout actions={actions} title="Add Surgery">
      <div>
        {/* Surgery Details */}
        <section className="mt-1">
          <div className="flex flex-col mt-2">
            <div className="flex items-end space-x-2 w-full">
              <div className="flex flex-col w-full">
                <label htmlFor="surgery" className="pb-1">
                  Surgery Title
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
                <AutoCompleteInput multiple={true} />
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
    </AppLayout>
  )
}
