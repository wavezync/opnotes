import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { queries } from '../../lib/queries'
import { Input } from '@renderer/components/ui/input'
import { useSettings } from '@renderer/contexts/SettingsContext'
import { Button } from '@renderer/components/ui/button'
import { Save } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

const formSchema = z.object({
  hospital: z.string(),
  unit: z.string()
})

type FormSchema = z.infer<typeof formSchema>

export const SettingsIndex = () => {
  const queryClient = useQueryClient()
  const { settings } = useSettings()
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hospital: settings['hospital'] || '',
      unit: settings['unit'] || ''
    }
  })
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([{ label: 'Settings', to: '/settings' }])
  }, [setBreadcrumbs])

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
  const onSubmit = async (data: FormSchema) => {
    await updateSettingsMutation.mutateAsync(data)
  }

  const submitForm = form.handleSubmit(onSubmit)

  return (
    <AppLayout title="Settings">
      <div className="">
        <h2 className="text-2xl font-bold">General Settings</h2>
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

          <div className="flex justify-start mt-2">
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
      </div>
    </AppLayout>
  )
}
