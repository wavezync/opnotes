import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '../ui/input'

import { forwardRef, useImperativeHandle } from 'react'
import toast from 'react-hot-toast'
import { unwrapResult } from '@renderer/lib/utils'
import { DoctorModel } from '@shared/models/DoctorModel'

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

        toast.success('Doctor added successfully', {
          position: 'bottom-center'
        })

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

        toast.success('Doctor updated successfully', {
          position: 'bottom-center'
        })

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
        <form className="flex flex-col space-y-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Name..." {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col w-full">
            <FormField
              name="designation"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Designation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col w-full">
            <FormField
              name="slmc_reg_no"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SLMC No</FormLabel>
                  <FormControl>
                    <Input placeholder="SLMC No" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    )
  }
)

AddOrEditDoctor.displayName = 'AddOrEditDoctor'
