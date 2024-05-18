import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { SurgeryModel } from 'src/shared/models/SurgeryModel'
import { z } from 'zod'
import { Input } from '../ui/input'
import { DatePicker } from '../ui/date-picker'
import { AutoCompleteInput } from '../common/AutoCompleteInput'
import { RichTextEditor } from '../common/RichTextEditor'

import { useEffect } from 'react'
import { DoctorAutoComplete } from '../doctor/DoctorAutoComplete'

const KBD = ({ children }: { children: React.ReactNode }) => (
  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
    {children}
  </kbd>
)

const surgerySchema = z.object({
  title: z.string(),
  bht: z.string(),
  ward: z.string(),
  date: z.date().nullable(),
  doneBy: z.array(z.number()),
  assistedBy: z.array(z.number()),
  notes: z.string().optional(),
  postOpNotes: z.string().optional()
})

type SurgeryFormSchema = z.infer<typeof surgerySchema>

export interface AddOrEditSurgeryProps {
  surgery?: SurgeryModel
  onUpdated?: (surgery: SurgeryModel) => void
}

export const AddOrEditSurgery = ({ surgery, onUpdated }: AddOrEditSurgeryProps) => {
  const form = useForm<SurgeryFormSchema>({
    resolver: zodResolver(surgerySchema),
    defaultValues: {
      bht: surgery?.bht || '',
      title: surgery?.title || '',
      ward: surgery?.ward || '',
      date: surgery?.date || null,
      assistedBy: surgery?.assistedBy?.map((ab) => ab.id) || [],
      doneBy: surgery?.doneBy?.map((db) => db.id) || [],
      notes: surgery?.notes || '',
      postOpNotes: surgery?.post_op_notes || ''
    }
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && e.ctrlKey && e.shiftKey) {
        e.preventDefault()
        // Insert ↓ to surgery title
        form.setValue('title', form.getValues('title') + '↓')
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [form])

  return (
    <Form {...form}>
      <form className="flex flex-col space-y-2">
        {/* Surgery Details */}
        <section className="mt-1">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Surgery Title..." {...field} />
                </FormControl>
                <FormDescription>
                  Press{' '}
                  <KBD>
                    <span className="text-xs">Ctrl</span>
                  </KBD>
                  +
                  <KBD>
                    <span className="text-xs">Shift</span>
                  </KBD>
                  +
                  <KBD>
                    <span className="text-xs">↓</span>
                  </KBD>{' '}
                  to add ↓ to title
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col md:flex-row md:items-end md:space-x-2 w-full mt-1">
            <div className="flex flex-col w-full md:w-1/2">
              <FormField
                name="bht"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BHT</FormLabel>
                    <FormControl>
                      <Input placeholder="BHT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col w-full md:w-1/2">
              <FormField
                name="ward"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward</FormLabel>
                    <FormControl>
                      <Input placeholder="Ward" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col">
              <FormField
                name="date"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        {...field}
                        onSelect={field.onChange}
                        selected={field.value || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col mt-4">
            <div className="flex items-start md:flex-row flex-col gap-2">
              <div className="flex flex-col md:w-1/2">
                <FormField
                  control={form.control}
                  name="doneBy"
                  render={({ field: { value, ...field } }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Done By</FormLabel>
                      <FormControl>
                        <DoctorAutoComplete />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col md:w-1/2">
                <FormField
                  control={form.control}
                  name="assistedBy"
                  render={({ field: { value, ...field } }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Assisted By</FormLabel>
                      <FormControl>
                        <DoctorAutoComplete />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <FormField
              control={form.control}
              name="notes"
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <RichTextEditor initialContent={value || undefined} onUpdate={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col">
            <FormField
              control={form.control}
              name="postOpNotes"
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel>Post Op Notes</FormLabel>
                  <FormControl>
                    <RichTextEditor initialContent={value || undefined} onUpdate={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
      </form>
    </Form>
  )
}
