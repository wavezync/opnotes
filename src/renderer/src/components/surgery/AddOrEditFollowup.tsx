import { Followup } from 'src/shared/types/db'
import {
  Sheet,
  SheetContent,
  SheetDescription,
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

export interface AddOrEditFollowupProps {
  surgeryId?: number
  followup?: Followup
  onClose?: () => void
  onUpdated?: (followup: Followup | null) => void
  trigger?: React.ReactNode
}

const followupSchema = z.object({
  notes: z.string().min(1, {
    message: 'Note is required'
  })
})

type FollowupSchema = z.infer<typeof followupSchema>

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
    } catch (error) {
      toast.error('Failed to save followup')
    }
  }

  const submitForm = form.handleSubmit(onSubmit)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="sm:max-w-none w-[600px]">
        <Form {...form}>
          <SheetHeader>
            <SheetTitle>{!isUpdate ? <>Add Followup</> : <>Edit Followup</>}</SheetTitle>
            <SheetDescription>
              {!isUpdate ? (
                <>Add a new followup for this surgery</>
              ) : (
                <>Edit the followup for this surgery</>
              )}
            </SheetDescription>

            <FormField
              name="notes"
              control={form.control}
              render={({ field }) => (
                <FormItem>
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
          </SheetHeader>
          <SheetFooter>
            <Button
              type="submit"
              onClick={submitForm}
              isLoading={createNewFollowupMutation.isPending || updateFollowupMutation.isPending}
            >
              Save changes
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
