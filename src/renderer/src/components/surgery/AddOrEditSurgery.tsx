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

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { DoctorAutoComplete } from '../doctor/DoctorAutoComplete'
import { toast } from '@renderer/components/ui/sonner'
import { SurgeryModel } from '../../../../shared/models/SurgeryModel'
import { unwrapResult } from '@renderer/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import {
  Stethoscope,
  FileText,
  Calendar,
  Users,
  Hash,
  Lightbulb,
  ClipboardPlus,
  Pill,
  FileOutput
} from 'lucide-react'

const toValidDate = (date?: Date | null): Date | null => {
  if (!date) return null
  return !isNaN(date.getTime()) ? date : null
}

const surgerySchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  bht: z.string().min(1, { message: 'BHT is required' }),
  ward: z.string().min(1, { message: 'Ward is required' }),
  date: z.date().nullable(),
  doa: z.date().nullable(),
  dod: z.date().nullable(),
  doneBy: z.array(z.number()),
  assistedBy: z.array(z.number()),
  notes: z.string().optional(),
  inward_management: z.string().optional(),
  post_op_notes: z.string().optional(),
  referral: z.string().optional()
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
    const titleInputRef = useRef<HTMLInputElement>(null)
    const form = useForm<SurgeryFormSchema>({
      resolver: zodResolver(surgerySchema),
      defaultValues: {
        bht: surgery?.bht || '',
        title: surgery?.title || '',
        ward: surgery?.ward || '',
        date: toValidDate(surgery?.date),
        doa: toValidDate(surgery?.doa),
        dod: toValidDate(surgery?.dod),
        assistedBy: surgery?.assistedBy?.map((ab) => ab.id) || [],
        doneBy: surgery?.doneBy?.map((db) => db.id) || [],
        notes: surgery?.notes || '',
        inward_management: surgery?.inward_management || '',
        post_op_notes: surgery?.post_op_notes || '',
        referral: surgery?.referral || ''
      }
    })

    const isUpdate = !!surgery

    const createNewSurgery = async (data: SurgeryFormSchema) => {
      try {
        console.log(data)
        if (!patientId) throw new Error('Patient ID is required')
        const { doneBy, assistedBy, date, doa, dod, ...rest } = data

        const { result, error } = await window.api.invoke('createNewSurgery', {
          ...rest,
          patient_id: patientId,
          date: date ? +date : null,
          doa: doa ? +doa : null,
          dod: dod ? +dod : null
        })

        if (error) throw error

        if (!result) throw new Error('Failed to create surgery')

        await unwrapResult(
          window.api.invoke('updateSurgeryDoctorsAssistedBy', result.id, assistedBy)
        )
        await unwrapResult(window.api.invoke('updateSurgeryDoctorsDoneBy', result.id, doneBy))

        toast.success('Surgery created successfully')

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

        const { doneBy, assistedBy, date, doa, dod, ...rest } = data

        const { result, error } = await window.api.invoke('updateSurgery', surgery.id, {
          ...rest,
          date: date ? +date : null,
          doa: doa ? +doa : null,
          dod: dod ? +dod : null
        })

        if (error) throw error

        if (!result) throw new Error('Failed to update surgery')

        await unwrapResult(
          window.api.invoke('updateSurgeryDoctorsAssistedBy', surgery.id, assistedBy)
        )
        await unwrapResult(window.api.invoke('updateSurgeryDoctorsDoneBy', surgery.id, doneBy))

        toast.success('Surgery updated successfully')

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

    // Insert down arrow into title
    const insertDownArrow = useCallback(() => {
      const currentTitle = form.getValues('title')
      form.setValue('title', currentTitle + '↓')
      // Focus the input and move cursor to end
      if (titleInputRef.current) {
        titleInputRef.current.focus()
        const len = titleInputRef.current.value.length
        titleInputRef.current.setSelectionRange(len, len)
      }
    }, [form])

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown' && e.ctrlKey && e.shiftKey) {
          e.preventDefault()
          insertDownArrow()
        }
      }

      window.addEventListener('keydown', handleKeyDown)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }, [insertDownArrow])

    return (
      <Form {...form}>
        <form className="space-y-4">
          {/* Procedure Title Card */}
          <Card
            className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
            style={{ animationDelay: '0ms' }}
          >
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-emerald-500" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Procedure
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Surgery Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Appendectomy, Cholecystectomy..."
                        {...field}
                        ref={(e) => {
                          field.ref(e)
                          // @ts-expect-error ref assignment
                          titleInputRef.current = e
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Prominent Shortcut Hint */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Pro tip: Add down arrow (↓) to title
                  </p>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                    Press{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[10px]">
                      Ctrl
                    </kbd>
                    {' + '}
                    <kbd className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[10px]">
                      Shift
                    </kbd>
                    {' + '}
                    <kbd className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[10px]">
                      ↓
                    </kbd>
                    {' or click the button'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={insertDownArrow}
                  className="flex-shrink-0 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300"
                >
                  Insert ↓
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Details Card - BHT & Ward */}
          <Card
            className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
            style={{ animationDelay: '75ms' }}
          >
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Hash className="h-4 w-4 text-blue-500" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Details
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="bht"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">BHT</FormLabel>
                      <FormControl>
                        <Input placeholder="BHT Number" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Bed Head Ticket number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="ward"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Ward</FormLabel>
                      <FormControl>
                        <Input placeholder="Ward name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dates Card */}
          <Card
            className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
            style={{ animationDelay: '150ms' }}
          >
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-amber-500" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Dates
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  name="date"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium">Surgery Date</FormLabel>
                      <FormControl>
                        <DatePicker onSelect={field.onChange} selected={field.value || undefined} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="doa"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium">Date of Admission</FormLabel>
                      <FormControl>
                        <DatePicker onSelect={field.onChange} selected={field.value || undefined} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="dod"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium">Date of Discharge</FormLabel>
                      <FormControl>
                        <DatePicker onSelect={field.onChange} selected={field.value || undefined} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Surgical Team Card */}
          <Card
            className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
            style={{ animationDelay: '225ms' }}
          >
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-violet-500" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Surgical Team
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="doneBy"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium">Done By</FormLabel>
                      <FormControl>
                        <DoctorAutoComplete
                          onSelected={(ids) => {
                            field.onChange(ids.map((id) => +id))
                          }}
                          selectedDoctorIds={field.value.map((v) => v.toString())}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Primary surgeon(s)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assistedBy"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium">Assisted By</FormLabel>
                      <FormControl>
                        <DoctorAutoComplete
                          onSelected={(ids) => {
                            field.onChange(ids.map((id) => +id))
                          }}
                          selectedDoctorIds={field.value.map((v) => v.toString())}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Assisting surgeon(s)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card
            className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-amber-500" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Operative Notes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <FormField
                control={form.control}
                name="notes"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
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
            </CardContent>
          </Card>

          {/* Inward Management Card */}
          <Card
            className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
            style={{ animationDelay: '375ms' }}
          >
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Pill className="h-4 w-4 text-purple-500" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Inward Management
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <FormField
                control={form.control}
                name="inward_management"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormDescription className="text-xs mb-2">
                      Record IV drugs and medications given during admission
                    </FormDescription>
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
            </CardContent>
          </Card>

          {/* Post-Op Notes Card */}
          <Card
            className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
            style={{ animationDelay: '450ms' }}
          >
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <ClipboardPlus className="h-4 w-4 text-rose-500" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Post-Operative Care
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <FormField
                control={form.control}
                name="post_op_notes"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
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
            </CardContent>
          </Card>

          {/* Referral Letter Card */}
          <Card
            className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
            style={{ animationDelay: '525ms' }}
          >
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <FileOutput className="h-4 w-4 text-teal-500" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Referral
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <FormField
                control={form.control}
                name="referral"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormDescription className="text-xs mb-2">
                      Write a referral for wound management or follow-up care (optional)
                    </FormDescription>
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
            </CardContent>
          </Card>
        </form>
      </Form>
    )
  }
)

AddOrEditSurgery.displayName = 'AddOrEditSurgery'
