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
import { z } from 'zod'
import { Input } from '../ui/input'
import { DatePicker } from '../ui/date-picker'
import { RichTextEditor } from '../common/RichTextEditor'

import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { DoctorAutoComplete } from '../doctor/DoctorAutoComplete'
import toast from 'react-hot-toast'
import { SurgeryModel } from '../../../../shared/models/SurgeryModel'
import { unwrapResult } from '@renderer/lib/utils'
const KBD = ({ children }: { children: React.ReactNode }) => (
  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
    {children}
  </kbd>
)

const surgerySchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }), // Add a custom error message for min(1
  bht: z.string().min(1, { message: 'BHT is required' }),
  ward: z.string().min(1, { message: 'Ward is required' }),
  date: z.date().nullable(),
  doneBy: z.array(z.number()),
  assistedBy: z.array(z.number()),
  notes: z.string().optional(),
  post_op_notes: z.string().optional()
})

type SurgeryFormSchema = z.infer<typeof surgerySchema>

export interface AddOrEditSurgeryProps {
  surgery?: SurgeryModel
  onUpdated?: (surgery: SurgeryModel) => void
  patientId?: number
}

export interface AddOrEditSurgeryRef {
  submit: () => void
}

export const AddOrEditSurgery = forwardRef<AddOrEditSurgeryRef, AddOrEditSurgeryProps>(
  ({ surgery, patientId, onUpdated }: AddOrEditSurgeryProps, ref) => {
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
        post_op_notes: surgery?.post_op_notes || ''
      }
    })

    const isUpdate = !!surgery

    const createNewSurgery = async (data: SurgeryFormSchema) => {
      try {
        console.log(data)
        if (!patientId) throw new Error('Patient ID is required')
        const { doneBy, assistedBy, date, ...rest } = data

        const { result, error } = await window.api.invoke('createNewSurgery', {
          ...rest,
          patient_id: patientId,
          date: date ? +date : null
        })

        if (error) throw error

        if (!result) throw new Error('Failed to create surgery')

        await unwrapResult(
          window.api.invoke('updateSurgeryDoctorsAssistedBy', result.id, assistedBy)
        )
        await unwrapResult(window.api.invoke('updateSurgeryDoctorsDoneBy', result.id, doneBy))

        toast.success('Surgery created successfully', {
          position: 'bottom-center'
        })

        if (onUpdated) {
          onUpdated(new SurgeryModel(result))
        }
      } catch (error) {
        console.log(error)
        toast.error('Failed to create surgery')
      }
    }

    const updateRecord = async (data: SurgeryFormSchema) => {
      try {
        if (!surgery) throw new Error('Surgery is required')

        const { doneBy, assistedBy, date, ...rest } = data

        const { result, error } = await window.api.invoke('updateSurgery', surgery.id, {
          ...rest,
          date: date ? +date : null
        })

        if (error) throw error

        if (!result) throw new Error('Failed to update surgery')

        await unwrapResult(
          window.api.invoke('updateSurgeryDoctorsAssistedBy', surgery.id, assistedBy)
        )
        await unwrapResult(window.api.invoke('updateSurgeryDoctorsDoneBy', surgery.id, doneBy))

        toast.success('Surgery updated successfully', {
          position: 'bottom-center'
        })

        if (onUpdated) {
          onUpdated(new SurgeryModel(result))
        }
      } catch (error) {
        console.error(error)
        toast.error('Failed to update surgery')
      }
    }

    const onSubmit = async (data: SurgeryFormSchema) => {
      try {
        if (!isUpdate) {
          await createNewSurgery(data)
          return
        }

        await updateRecord(data)
      } catch (error) {
        console.log(error)
      }
    }

    const submitForm = form.handleSubmit(onSubmit)

    useImperativeHandle(ref, () => ({
      submit: submitForm
    }))

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
                    to insert a ↓ to title
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
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Done By</FormLabel>
                        <FormControl>
                          <DoctorAutoComplete
                            onSelected={(ids) => {
                              field.onChange(ids.map((id) => +id))
                            }}
                            selectedDoctorIds={field.value.map((v) => v.toString())}
                          />
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
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Assisted By</FormLabel>
                        <FormControl>
                          <DoctorAutoComplete
                            onSelected={(ids) => {
                              field.onChange(ids.map((id) => +id))
                            }}
                            selectedDoctorIds={field.value.map((v) => v.toString())}
                          />
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
                      <RichTextEditor
                        initialContent={value || undefined}
                        onUpdate={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col">
              <FormField
                control={form.control}
                name="post_op_notes"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Post Op Notes</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        initialContent={value || undefined}
                        onUpdate={field.onChange}
                      />
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
)

AddOrEditSurgery.displayName = 'AddOrEditSurgery'
