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
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Save, RotateCcw, Building2, Phone, Building, Wand2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSettings } from '@renderer/contexts/SettingsContext'
import { queries } from '@renderer/lib/queries'
import { useEffect } from 'react'
import { toast } from '@renderer/components/ui/sonner'

const formSchema = z.object({
  hospital: z.string(),
  unit: z.string(),
  telephone: z.string()
})

type FormSchema = z.infer<typeof formSchema>

export const GeneralSettings = () => {
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
      toast.success('Settings updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const resetOnboardingMutation = useMutation({
    mutationFn: async () => {
      await window.api.invoke('updateSettings', [{ key: 'onboarding_completed', value: null }])
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(queries.app.settings)
    }
  })

  const onSubmit = async (data: FormSchema) => {
    await updateSettingsMutation.mutateAsync(data)
  }

  const submitForm = form.handleSubmit(onSubmit)

  return (
    <div className="space-y-6">
      {/* Hospital Information Card */}
      <Card className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up overflow-hidden">
        <CardHeader className="pb-4 pt-5 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="flex items-center gap-3 relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-500/20">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Hospital Information</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Details shown on printed reports
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <Form {...form}>
            <form className="space-y-5">
              <FormField
                name="hospital"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                        <Building2 className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <FormLabel className="text-sm font-medium">Hospital Name</FormLabel>
                    </div>
                    <FormControl>
                      <Input placeholder="e.g., National Hospital" {...field} className="h-11" />
                    </FormControl>
                    <FormDescription className="text-xs">
                      This will appear in the header of printed BHT reports
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  name="unit"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                          <Building className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <FormLabel className="text-sm font-medium">Unit / Department</FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="e.g., Surgical Oncology"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Department or unit name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="telephone"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                          <Phone className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <FormLabel className="text-sm font-medium">Contact Number</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="e.g., 011-2345678" {...field} className="h-11" />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Hospital contact number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-start pt-2">
                <Button
                  type="submit"
                  variant="gradient"
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={() => submitForm()}
                  isLoading={updateSettingsMutation.isPending}
                  loadingText="Saving..."
                >
                  Save Settings
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Setup Wizard Card */}
      <Card
        className="bg-gradient-to-br from-amber-500/5 to-amber-600/5 border-amber-500/20 animate-fade-in-up"
        style={{ animationDelay: '75ms' }}
      >
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Wand2 className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Setup Wizard
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Re-run the setup wizard to update your hospital information and review the app features.
          </p>
          <Button
            variant="outline"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={() => resetOnboardingMutation.mutate()}
            isLoading={resetOnboardingMutation.isPending}
            loadingText="Resetting..."
          >
            Run Setup Wizard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
