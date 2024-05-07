/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Patient } from 'src/shared/types/db'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import { Button } from '../ui/button'
import { useCallback, useMemo } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form'
import { SaveIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { RichTextEditor } from '../common/RichTextEditor'

export interface CreatePatientFormProps {
  onRecordUpdated?: (patient: Patient) => void
  values?: Patient
}

const AGE_PATTERN = /^(\d+)y(?:\s([1-9]|1[0-1])m)?$|^([1-9]|1[0-1])m$/

const approximateBirthYear = (age: string | null) => {
  if (!age) {
    return null
  }

  const now = new Date() // Get the current date.
  const currentYear = now.getFullYear() // Current year.
  const currentMonth = now.getMonth() + 1 // Current month (January is 0, so add 1).

  const match = age.match(AGE_PATTERN)
  if (match) {
    const years = match[1] ? parseInt(match[1], 10) : 0 // Extract years if present.
    const months = match[2] ? parseInt(match[2], 10) : match[3] ? parseInt(match[3], 10) : 0 // Extract months, whether standalone or with year.

    let birthYear = currentYear - years
    if (months > 0) {
      if (currentMonth <= months) {
        // If the current month is less than or equal to the months part, subtract an extra year.
        birthYear -= 1
      }
    }

    return birthYear
  }

  return null // Return null if the input string does not match the expected format.
}

const birthYearFromAge = (birth_year: number) => {
  const now = new Date() // Get the current date.
  const currentYear = now.getFullYear() // Current year.

  return currentYear - birth_year
}

const patientSchema = z.object({
  phn: z.string().min(1, {
    message: 'PHN is required'
  }),
  name: z.string().min(1, {
    message: 'Name is required'
  }),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  emergency_contact: z.string().optional().nullable(),
  emergency_phone: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  age: z
    .string()
    .regex(AGE_PATTERN, 'Age must be in the format(year, year month or month) ie: 20y, 10y 6m, 5m'),
  gender: z.enum(['M', 'F'], {
    message: 'Select Gender'
  })
})

type FormSchema = z.infer<typeof patientSchema>

export const NewPatientForm = ({ onRecordUpdated, values }: CreatePatientFormProps) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: values?.name || '',
      phn: values?.phn || '',
      address: values?.address || '',
      phone: values?.phone || '',
      remarks: values?.remarks || '',
      emergency_contact: values?.emergency_contact || '',
      emergency_phone: values?.emergency_phone || '',
      gender: values?.gender || ('' as any),
      age: values && values.birth_year ? `${birthYearFromAge(values.birth_year)}y` : ''
    }
  })
  const isUpdate = values && !!values.id

  const watchAge = form.watch('age')
  const birthYear = useMemo(() => approximateBirthYear(watchAge), [watchAge])
  const resetForm = useCallback(() => {
    if (isUpdate) {
      form.reset({
        ...values,
        age: values && values.birth_year ? `${birthYearFromAge(values.birth_year)}y` : ''
      })

      return
    }

    form.reset({
      phn: '',
      name: '',
      age: '',
      address: '',
      phone: '',
      emergency_contact: '',
      emergency_phone: '',
      remarks: '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gender: '' as any
    })
  }, [form, isUpdate, values])

  const createNewRecord = async (data: FormSchema) => {
    if (!birthYear) {
      return
    }
    const { result, error } = await window.api.invoke('createNewPatient', {
      phn: data.phn,
      name: data.name,
      birth_year: birthYear,
      gender: data.gender,
      address: data.address,
      phone: data.phone,
      emergency_contact: data.emergency_contact,
      emergency_phone: data.emergency_phone,
      remarks: data.remarks
    })

    if (error) {
      if (error.extra && error.extra['code'] === 'SQLITE_CONSTRAINT_UNIQUE') {
        toast.error('Patient with the same PHN already exists')
        return
      }
    }

    if (result) {
      onRecordUpdated?.(result)

      resetForm()
    }

    return result
  }

  const updateRecord = async (data: FormSchema) => {
    if (!birthYear) {
      return
    }
    if (!values?.id) {
      return
    }

    const { result, error } = await window.api.invoke('updatePatientById', values.id, {
      phn: data.phn,
      name: data.name,
      birth_year: birthYear,
      gender: data.gender,
      address: data.address,
      phone: data.phone,
      emergency_contact: data.emergency_contact,
      emergency_phone: data.emergency_phone,
      remarks: data.remarks
    })

    if (error) {
      if (error.extra && error.extra['code'] === 'SQLITE_CONSTRAINT_UNIQUE') {
        toast.error('Patient with the same PHN already exists')
        return
      }
    }

    if (result) {
      onRecordUpdated?.(result)
    }

    return result
  }

  const onSubmit = async (data: FormSchema) => {
    try {
      if (!isUpdate) {
        await createNewRecord(data)
        return
      }

      await updateRecord(data)
    } catch (error) {
      console.log(error)
      toast.error(`Failed to update patient: ${(error as any).message}`)
    }
  }

  const submitForm = form.handleSubmit(onSubmit)

  return (
    <Form {...form}>
      <form className="flex flex-col space-y-2">
        <div className="flex w-full space-x-1">
          <FormField
            control={form.control}
            name="phn"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>PHN</FormLabel>
                <FormControl>
                  <Input placeholder="Enter PHN..." {...field} />
                </FormControl>
                <FormDescription>
                  PHN of patient is a unique field usually comes with the admission
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the name of patient" {...field} />
                </FormControl>
                <FormDescription>Name can be used to lookup patient in future</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex space-x-1 w-full">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input placeholder="Eg: 20y, 45y 8m, 10m" {...field} />
                </FormControl>
                <FormDescription>
                  {birthYear ? (
                    <span>
                      Birth year is approximately <strong className="bold">{birthYear}</strong>
                    </span>
                  ) : (
                    <span>
                      Enter the age we will calculate the birth year of the patient.
                      <br /> If the user is
                      <i> 20years old</i> enter <strong>20y</strong>. If the patient is{' '}
                      <i>1 year 6 months</i> old enter <strong>1y 6m</strong>
                    </span>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Gender..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field: { value, ...field } }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter the address of patient" value={value || ''} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex grow space-x-1 w-full">
          <FormField
            control={form.control}
            name="phone"
            render={({ field: { value, ...field } }) => (
              <FormItem className="w-full">
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter the phone number of patient"
                    value={value || ''}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergency_contact"
            render={({ field: { value, ...field } }) => (
              <FormItem className="w-full">
                <FormLabel>Emergency Contact</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the emergency contact" value={value || ''} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergency_phone"
            render={({ field: { value, ...field } }) => (
              <FormItem className="w-full">
                <FormLabel>Emergency Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter the emergency phone number"
                    value={value || ''}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="remarks"
          render={({ field: { value, ...field } }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <RichTextEditor initialContent={value || undefined} onUpdate={field.onChange} />
              </FormControl>
              <FormDescription className="mx-1">
                Any additional remarks about the patient
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-2 justify-end">
          <Button
            type="submit"
            onClick={submitForm}
            loadingText={'Saving...'}
            leftIcon={<SaveIcon className="w-5 h-5" />}
          >
            Save
          </Button>

          <Button type="reset" variant="secondary" onClick={() => resetForm()}>
            Reset
          </Button>
        </div>
      </form>
    </Form>
  )
}
