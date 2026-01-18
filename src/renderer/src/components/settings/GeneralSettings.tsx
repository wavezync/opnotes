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
import { Save, RotateCcw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSettings } from '@renderer/contexts/SettingsContext'
import { queries } from '@renderer/lib/queries'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

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
    <div>
      <h2 className="text-xl font-bold mb-4">General</h2>
      <Form {...form}>
        <FormField
          name="hospital"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hospital</FormLabel>
              <FormControl>
                <Input placeholder="Hospital Name" {...field} />
              </FormControl>
              <FormDescription>
                Name of the hospital, this will be used when printing BHT
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
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Input placeholder="Unit Name" {...field} />
              </FormControl>
              <FormDescription>
                Name of the hospital unit, this will be used when printing BHT
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
              <FormLabel>Telephone</FormLabel>
              <FormControl>
                <Input placeholder="Telephone Number" {...field} />
              </FormControl>
              <FormDescription>
                Contact telephone number, this will be used when printing BHT
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-start mt-4">
          <Button
            type="submit"
            leftIcon={<Save />}
            onClick={() => submitForm()}
            isLoading={updateSettingsMutation.isPending}
            loadingText="Saving..."
          >
            Save
          </Button>
        </div>
      </Form>

      <div className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-semibold mb-2">Setup Wizard</h3>
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
      </div>
    </div>
  )
}
