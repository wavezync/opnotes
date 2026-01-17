import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { TagsInput } from '@renderer/components/ui/tags-input'
import { RichTextEditor } from '@renderer/components/common/RichTextEditor'
import { Label } from '@renderer/components/ui/label'
import { queries } from '@renderer/lib/queries'
import { unwrapResult } from '@renderer/lib/utils'
import { SurgeryTemplate } from 'src/shared/types/db'

// Helper function to parse tags from JSON string
const parseTags = (tags: string | null): string[] => {
  if (!tags) return []
  try {
    return JSON.parse(tags)
  } catch {
    return []
  }
}

const PREDEFINED_CATEGORIES = [
  'Operative Findings',
  'Procedure',
  'Closure',
  'Post-op Instructions',
  'Complications',
  'Follow-up',
  'General'
]

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),
  scope: z.enum(['global', 'doctor']),
  doctorId: z.number().nullable(),
  content: z.string().min(1, 'Content is required')
})

type FormSchema = z.infer<typeof formSchema>

interface TemplateFormProps {
  template?: SurgeryTemplate | null
  onSuccess?: () => void
  onCancel?: () => void
}

export const TemplateForm = ({ template, onSuccess, onCancel }: TemplateFormProps) => {
  const queryClient = useQueryClient()
  const [customCategory, setCustomCategory] = useState('')
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false)
  const isEditing = !!template

  const { data: doctorsData } = useQuery({
    ...queries.doctors.list({ pageSize: 100 })
  })

  const { data: existingCategories } = useQuery({
    queryKey: ['surgeryTemplates', 'categories'],
    queryFn: () => unwrapResult(window.api.invoke('getTemplateCategories'))
  })

  // Merge predefined and existing categories
  const allCategories = [
    ...new Set([...PREDEFINED_CATEGORIES, ...(existingCategories || [])])
  ].sort()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: '',
      tags: [],
      scope: 'global',
      doctorId: null,
      content: ''
    }
  })

  const scope = form.watch('scope')

  useEffect(() => {
    if (template) {
      form.reset({
        title: template.title,
        category: template.category,
        tags: parseTags(template.tags),
        scope: template.doctor_id ? 'doctor' : 'global',
        doctorId: template.doctor_id,
        content: template.content
      })
    }
  }, [template, form])

  const createMutation = useMutation({
    mutationFn: async (data: FormSchema) => {
      const payload = {
        title: data.title,
        category: data.category,
        tags: JSON.stringify(data.tags),
        doctor_id: data.scope === 'doctor' ? data.doctorId : null,
        content: data.content
      }
      return unwrapResult(window.api.invoke('createSurgeryTemplate', payload))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['surgeryTemplates'] })
      toast.success('Template created successfully')
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (data: FormSchema) => {
      if (!template) return
      const payload = {
        title: data.title,
        category: data.category,
        tags: JSON.stringify(data.tags),
        doctor_id: data.scope === 'doctor' ? data.doctorId : null,
        content: data.content
      }
      return unwrapResult(window.api.invoke('updateSurgeryTemplateById', template.id, payload))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['surgeryTemplates'] })
      toast.success('Template updated successfully')
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const onSubmit = async (data: FormSchema) => {
    if (isEditing) {
      await updateMutation.mutateAsync(data)
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleCategoryChange = (value: string) => {
    if (value === '__custom__') {
      setShowCustomCategoryInput(true)
      return
    }
    form.setValue('category', value)
    setCustomCategory('')
    setShowCustomCategoryInput(false)
  }

  const handleCustomCategorySubmit = () => {
    if (customCategory.trim()) {
      form.setValue('category', customCategory.trim())
      setShowCustomCategoryInput(false)
      setCustomCategory('')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Standard Appendectomy" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="category"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={handleCategoryChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">+ Add custom category</SelectItem>
                </SelectContent>
              </Select>
              {showCustomCategoryInput && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCustomCategorySubmit()
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCustomCategorySubmit}
                  >
                    Add
                  </Button>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Controller
          name="tags"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagsInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type and press Enter to add tags"
                />
              </FormControl>
              <FormDescription>
                Tags help organize and search templates (e.g., laparoscopic, emergency)
              </FormDescription>
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Scope</FormLabel>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="scope-global"
                value="global"
                checked={scope === 'global'}
                onChange={() => {
                  form.setValue('scope', 'global')
                  form.setValue('doctorId', null)
                }}
                className="h-4 w-4"
              />
              <Label htmlFor="scope-global" className="font-normal">
                Global (available to all doctors)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="scope-doctor"
                value="doctor"
                checked={scope === 'doctor'}
                onChange={() => form.setValue('scope', 'doctor')}
                className="h-4 w-4"
              />
              <Label htmlFor="scope-doctor" className="font-normal">
                Doctor-specific
              </Label>
            </div>
          </div>
        </FormItem>

        {scope === 'doctor' && (
          <FormField
            name="doctorId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString() || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctorsData?.data.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Controller
          name="content"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content *</FormLabel>
              <FormControl>
                <RichTextEditor
                  initialContent={field.value}
                  onUpdate={field.onChange}
                  showTemplateButton={false}
                  editorClassName="border m-1 rounded-md overflow-y-auto min-h-[300px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            isLoading={createMutation.isPending || updateMutation.isPending}
            loadingText={isEditing ? 'Updating...' : 'Creating...'}
          >
            {isEditing ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
