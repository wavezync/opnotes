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
import { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react'
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
import { toast } from '@renderer/components/ui/sonner'
import { RichTextEditor } from '../common/RichTextEditor'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { cn } from '@renderer/lib/utils'
import {
  Hash,
  User,
  Cake,
  MapPin,
  Phone,
  FileText,
  Calendar,
  HeartPulse,
  Droplets,
  AlertTriangle,
  ClipboardList,
  Pill
} from 'lucide-react'
import { TagsInput } from '../ui/tags-input'

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

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

// Helper functions to convert between arrays and comma-separated strings
const tagsToString = (tags: string[]): string | null => {
  return tags.length > 0 ? tags.join(',') : null
}

const stringToTags = (str: string | null): string[] => {
  return str ? str.split(',').filter((tag) => tag.trim()) : []
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
  }),
  // Medical history fields
  blood_group: z.enum(BLOOD_GROUPS).optional().nullable(),
  allergies: z.array(z.string()).optional().default([]),
  conditions: z.array(z.string()).optional().default([]),
  medications: z.array(z.string()).optional().default([])
})

type FormSchema = z.infer<typeof patientSchema>

export type NewPatientFormRef = {
  submit: () => void
  reset: () => void
}

export const NewPatientForm = forwardRef<NewPatientFormRef, CreatePatientFormProps>(
  ({ onRecordUpdated, values }, ref) => {
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
        age: values && values.birth_year ? `${birthYearFromAge(values.birth_year)}y` : '',
        // Medical history fields
        blood_group: values?.blood_group as typeof BLOOD_GROUPS[number] | null || null,
        allergies: stringToTags(values?.allergies || null),
        conditions: stringToTags(values?.conditions || null),
        medications: stringToTags(values?.medications || null)
      }
    })
    const isUpdate = values && !!values.id

    const watchAge = form.watch('age')
    const watchGender = form.watch('gender')
    const birthYear = useMemo(() => approximateBirthYear(watchAge), [watchAge])

    const resetForm = useCallback(() => {
      if (isUpdate) {
        form.reset({
          ...values,
          age: values && values.birth_year ? `${birthYearFromAge(values.birth_year)}y` : '',
          blood_group: values?.blood_group as typeof BLOOD_GROUPS[number] | null || null,
          allergies: stringToTags(values?.allergies || null),
          conditions: stringToTags(values?.conditions || null),
          medications: stringToTags(values?.medications || null)
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
        gender: '' as any,
        blood_group: null,
        allergies: [],
        conditions: [],
        medications: []
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
        remarks: data.remarks,
        blood_group: data.blood_group || null,
        allergies: tagsToString(data.allergies || []),
        conditions: tagsToString(data.conditions || []),
        medications: tagsToString(data.medications || [])
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
        remarks: data.remarks,
        blood_group: data.blood_group || null,
        allergies: tagsToString(data.allergies || []),
        conditions: tagsToString(data.conditions || []),
        medications: tagsToString(data.medications || [])
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

    useImperativeHandle(ref, () => ({
      submit: () => submitForm(),
      reset: () => resetForm()
    }))

    // Dynamic gender icon colors
    const genderIconBg = watchGender === 'M' ? 'bg-blue-500/10' : watchGender === 'F' ? 'bg-pink-500/10' : 'bg-muted'
    const genderIconColor = watchGender === 'M' ? 'text-blue-500' : watchGender === 'F' ? 'text-pink-500' : 'text-muted-foreground'

    return (
      <Form {...form}>
        <form className="space-y-4">
          {/* Row 1: Identity + Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Identity Card */}
            <Card
              className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
              style={{ animationDelay: '0ms' }}
            >
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-500" />
                  </div>
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Identity
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* PHN Field */}
                <FormField
                  control={form.control}
                  name="phn"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-6 w-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                          <Hash className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <FormLabel className="text-sm font-medium">PHN</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="Enter PHN..." {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Unique identifier from admission
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <FormLabel className="text-sm font-medium">Name</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="Enter the name of patient" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Used for patient lookup
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Demographics Card */}
            <Card
              className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
              style={{ animationDelay: '75ms' }}
            >
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Cake className="h-4 w-4 text-emerald-500" />
                  </div>
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Demographics
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Age Field */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                          <Cake className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <FormLabel className="text-sm font-medium">Age</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="Eg: 20y, 45y 8m, 10m" {...field} />
                      </FormControl>
                      {birthYear ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 mt-2">
                          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-xs">
                            Birth year:{' '}
                            <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {birthYear}
                            </strong>
                          </span>
                        </div>
                      ) : (
                        <FormDescription className="text-xs">
                          Format: 20y, 1y 6m, or 5m
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender Field */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={cn('h-6 w-6 rounded-md flex items-center justify-center transition-colors', genderIconBg)}>
                          <User className={cn('h-3.5 w-3.5 transition-colors', genderIconColor)} />
                        </div>
                        <FormLabel className="text-sm font-medium">Gender</FormLabel>
                      </div>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Location */}
          <Card
            className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
            style={{ animationDelay: '150ms' }}
          >
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-violet-500" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Location
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <FormField
                control={form.control}
                name="address"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the address of patient"
                        value={value || ''}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Row 3: Contact */}
          <Card
            className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
            style={{ animationDelay: '225ms' }}
          >
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-emerald-500" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Contact Information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field: { value, ...field } }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Phone number"
                          value={value || ''}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Emergency Contact Field */}
                <FormField
                  control={form.control}
                  name="emergency_contact"
                  render={({ field: { value, ...field } }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Emergency Contact</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contact name"
                          value={value || ''}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Emergency Phone Field */}
                <FormField
                  control={form.control}
                  name="emergency_phone"
                  render={({ field: { value, ...field } }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Emergency Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Emergency phone"
                          value={value || ''}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Row 4: Medical History */}
          <Card
            className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <HeartPulse className="h-4 w-4 text-rose-500" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Medical History
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Blood Group Field */}
              <FormField
                control={form.control}
                name="blood_group"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-6 w-6 rounded-md bg-red-500/10 flex items-center justify-center">
                        <Droplets className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <FormLabel className="text-sm font-medium">Blood Group</FormLabel>
                    </div>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BLOOD_GROUPS.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Allergies Field */}
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <FormLabel className="text-sm font-medium">Known Allergies</FormLabel>
                    </div>
                    <FormControl>
                      <TagsInput
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Add allergy..."
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Drug allergies, food allergies, environmental triggers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pre-existing Conditions Field */}
              <FormField
                control={form.control}
                name="conditions"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                        <ClipboardList className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      <FormLabel className="text-sm font-medium">Pre-existing Conditions</FormLabel>
                    </div>
                    <FormControl>
                      <TagsInput
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Add condition..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Current Medications Field */}
              <FormField
                control={form.control}
                name="medications"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                        <Pill className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <FormLabel className="text-sm font-medium">Current Medications</FormLabel>
                    </div>
                    <FormControl>
                      <TagsInput
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Add medication..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Row 5: Notes */}
          <Card
            className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
            style={{ animationDelay: '375ms' }}
          >
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-amber-500" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Notes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <FormField
                control={form.control}
                name="remarks"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <RichTextEditor initialContent={value || undefined} onUpdate={field.onChange} />
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

NewPatientForm.displayName = 'NewPatientForm'
