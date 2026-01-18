import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSettings } from '@renderer/contexts/SettingsContext'
import { useEffect, useImperativeHandle, forwardRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queries } from '@renderer/lib/queries'
import { Building2 } from 'lucide-react'

const formSchema = z.object({
  hospital: z.string().min(1, 'Hospital name is required'),
  unit: z.string().min(1, 'Unit name is required'),
  telephone: z.string()
})

type FormSchema = z.infer<typeof formSchema>

export interface HospitalInfoStepRef {
  submit: () => Promise<boolean>
}

export const HospitalInfoStep = forwardRef<HospitalInfoStepRef>((_, ref) => {
  const queryClient = useQueryClient()
  const { settings } = useSettings()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hospital: '',
      unit: '',
      telephone: ''
    }
  })

  useEffect(() => {
    if (settings) {
      form.reset({
        hospital: settings['hospital'] || '',
        unit: settings['unit'] || '',
        telephone: settings['telephone'] || ''
      })
    }
  }, [form, settings])

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: FormSchema) => {
      const updatePayload = Object.entries(data).map(([key, value]) => ({
        key,
        value
      }))
      await window.api.invoke('updateSettings', updatePayload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(queries.app.settings)
    }
  })

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const isValid = await form.trigger()
      if (!isValid) {
        return false
      }
      const data = form.getValues()
      await updateSettingsMutation.mutateAsync(data)
      return true
    }
  }))

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
        <Building2 className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Hospital Information</h2>
        <p className="text-muted-foreground">
          Enter your hospital details. This information will appear on printed documents.
        </p>
      </div>

      <Form {...form}>
        <form className="w-full max-w-md space-y-4">
          <FormField
            name="hospital"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hospital Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter hospital name" {...field} />
                </FormControl>
                <FormDescription>
                  The name of your hospital (e.g., General Hospital Colombo)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="unit"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter unit name" {...field} />
                </FormControl>
                <FormDescription>Your department or unit (e.g., Surgical Unit A)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="telephone"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Telephone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter telephone number" {...field} />
                </FormControl>
                <FormDescription>Contact number for the unit (optional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
})

HospitalInfoStep.displayName = 'HospitalInfoStep'
