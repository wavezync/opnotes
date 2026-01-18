import { Followup } from 'src/shared/types/db'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { RichTextEditor } from '../common/RichTextEditor'
import { Button } from '../ui/button'
import { useState } from 'react'
import { unwrapResult } from '@renderer/lib/utils'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queries } from '@renderer/lib/queries'
import { ChevronRight, Save } from 'lucide-react'

export interface AddOrEditFollowupProps {
  surgeryId?: number
  followup?: Followup
  onClose?: () => void
  onUpdated?: (followup: Followup | null) => void
  trigger?: React.ReactNode
}

const _followupSchema = z.object({
  notes: z.string().min(1, {
    message: 'Note is required'
  })
})

type FollowupSchema = z.infer<typeof _followupSchema>

export const AddOrEditFollowup = ({
  trigger,
  surgeryId,
  followup,
  onUpdated
}: AddOrEditFollowupProps) => {
  const queryClient = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const form = useForm<FollowupSchema>({
    defaultValues: {
      notes: followup?.notes || ''
    }
  })
  const createNewFollowupMutation = useMutation({
    mutationFn: ({ surgeryId, data }: { surgeryId: number; data: FollowupSchema }) =>
      unwrapResult(window.api.invoke('createNewFollowUp', surgeryId, data.notes)),
    onError: () => {
      toast.error('Failed to create followup')
    },
    onSuccess: (newFollowup) => {
      if (surgeryId) {
        queryClient.invalidateQueries({
          queryKey: queries.surgeries.getFollowups(surgeryId).queryKey
        })
      }

      onUpdated?.(newFollowup)
      setSheetOpen(false)
      form.reset({
        notes: ''
      })
    }
  })

  const updateFollowupMutation = useMutation({
    mutationFn: ({ followupId, data }: { followupId: number; data: FollowupSchema }) =>
      unwrapResult(window.api.invoke('updateFollowUp', followupId, data.notes)),
    onError: () => {
      toast.error('Failed to update followup')
    },
    onSuccess: (updatedFollowup) => {
      if (updatedFollowup) {
        queryClient.invalidateQueries({
          queryKey: queries.surgeries.getFollowups(updatedFollowup.surgery_id).queryKey
        })
      }

      onUpdated?.(updatedFollowup)
      setSheetOpen(false)
    }
  })

  const createNewFollowup = async (data: FollowupSchema) => {
    if (!surgeryId) return

    createNewFollowupMutation.mutate({ surgeryId, data })
  }

  const updateFollowup = async (data: FollowupSchema) => {
    if (!followup) return

    updateFollowupMutation.mutate({
      followupId: followup.id,
      data
    })
  }

  const isUpdate = !!followup

  const onSubmit = async (values: FollowupSchema) => {
    try {
      if (isUpdate) {
        await updateFollowup(values)
      } else {
        await createNewFollowup(values)
      }
    } catch {
      toast.error('Failed to save followup')
    }
  }

  const submitForm = form.handleSubmit(onSubmit)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="sm:max-w-none w-[720px] flex flex-col">
        <Form {...form}>
          <SheetHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <ChevronRight className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <SheetTitle className="text-lg">
                  {!isUpdate ? 'Add Follow-up' : 'Edit Follow-up'}
                </SheetTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {!isUpdate
                    ? 'Record a new follow-up note for this surgery'
                    : 'Update the follow-up details'}
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 py-4 overflow-hidden">
            <FormField
              name="notes"
              control={form.control}
              render={({ field }) => (
                <FormItem className="h-full">
                  <FormControl>
                    <RichTextEditor
                      initialContent={field.value || undefined}
                      onUpdate={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <SheetFooter className="pt-4 border-t">
            <Button
              type="submit"
              variant="gradient"
              onClick={submitForm}
              isLoading={createNewFollowupMutation.isPending || updateFollowupMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdate ? 'Save Changes' : 'Add Follow-up'}
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
