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
import { Building2, Phone, MapPin } from 'lucide-react'

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
    <div className="flex flex-col items-center space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse-soft" />
          <div className="relative h-16 w-16 rounded-xl bg-gradient-primary shadow-theme-primary flex items-center justify-center">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Hospital Information</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            This information will appear on printed surgical notes and reports
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form className="w-full space-y-5">
          <FormField
            name="hospital"
            control={form.control}
            render={({ field }) => (
              <FormItem className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Hospital Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., General Hospital Colombo"
                    className="h-11 bg-card/50 border-border/50 focus:border-primary/50"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  The official name of your healthcare facility
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="unit"
            control={form.control}
            render={({ field }) => (
              <FormItem className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Unit / Department
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Surgical Unit A"
                    className="h-11 bg-card/50 border-border/50 focus:border-primary/50"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Your department or ward within the hospital
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="telephone"
            control={form.control}
            render={({ field }) => (
              <FormItem className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Contact Number
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., +94 11 234 5678"
                    className="h-11 bg-card/50 border-border/50 focus:border-primary/50"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Unit contact number for printed documents
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* Info note */}
      <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <p className="text-xs text-muted-foreground text-center">
          You can update these settings anytime from{' '}
          <span className="text-foreground font-medium">Settings → General</span>
        </p>
      </div>
    </div>
  )
})

HospitalInfoStep.displayName = 'HospitalInfoStep'
