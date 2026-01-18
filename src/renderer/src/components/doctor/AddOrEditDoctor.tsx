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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

import { forwardRef, useImperativeHandle } from 'react'
import { toast } from '@renderer/components/ui/sonner'
import { unwrapResult } from '@renderer/lib/utils'
import { DoctorModel } from '@shared/models/DoctorModel'
import { User, Briefcase, Award, Stethoscope } from 'lucide-react'

const doctorSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required'
  }),
  designation: z.string().min(1, {
    message: 'Designation is required'
  }),
  slmc_reg_no: z.string()
})

type DoctorFormSchema = z.infer<typeof doctorSchema>

export interface AddOrEditDoctorProps {
  doctor?: DoctorModel
  onUpdated?: (doctor: DoctorModel) => void
}

export interface AddOrEditDoctorRef {
  submit: () => void
}

export const AddOrEditDoctor = forwardRef<AddOrEditDoctorRef, AddOrEditDoctorProps>(
  ({ doctor, onUpdated }: AddOrEditDoctorProps, ref) => {
    const form = useForm<DoctorFormSchema>({
      resolver: zodResolver(doctorSchema),
      defaultValues: {
        name: doctor?.name || '',
        designation: doctor?.designation || '',
        slmc_reg_no: doctor?.slmc_reg_no || ''
      }
    })

    const isUpdate = !!doctor

    const createNew = async (data: DoctorFormSchema) => {
      try {
        const result = await unwrapResult(window.api.invoke('createNewDoctor', data))

        toast.success('Doctor added successfully')

        if (result) {
          onUpdated?.(new DoctorModel(result))
        }
      } catch (error) {
        console.log(error)
        toast.error('Failed to add doctor')
      }
    }

    const updateRecord = async (data: DoctorFormSchema) => {
      try {
        if (!doctor) throw new Error('Doctor is required')

        const result = await unwrapResult(window.api.invoke('updateDoctorById', doctor.id, data))

        toast.success('Doctor updated successfully')

        if (result) {
          onUpdated?.(new DoctorModel(result))
        }
      } catch (error) {
        console.error(error)
        toast.error('Failed to update doctor')
      }
    }

    const onSubmit = async (data: DoctorFormSchema) => {
      try {
        if (!isUpdate) {
          await createNew(data)
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

    return (
      <Form {...form}>
        <form className="space-y-4">
          {/* Main Doctor Info Card */}
          <Card
            className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up overflow-hidden"
            style={{ animationDelay: '0ms' }}
          >
            {/* Card Header with decorative element */}
            <CardHeader className="pb-4 pt-5 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="flex items-center gap-3 relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center border border-violet-500/20">
                  <Stethoscope className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    Doctor Information
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Basic details and credentials
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-5">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Dr. John Smith"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      As it should appear on printed reports
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Two column layout for Designation and SLMC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Designation Field */}
                <FormField
                  name="designation"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                          <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <FormLabel className="text-sm font-medium">Designation</FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="e.g., GHO, MO, RMO"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Short form for printed reports
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* SLMC Registration Field */}
                <FormField
                  name="slmc_reg_no"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                          <Award className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <FormLabel className="text-sm font-medium">SLMC Registration</FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Registration number"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Optional - Medical Council number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcut Hint */}
          <div
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
              S
            </kbd>
            <span>to save</span>
          </div>
        </form>
      </Form>
    )
  }
)

AddOrEditDoctor.displayName = 'AddOrEditDoctor'
