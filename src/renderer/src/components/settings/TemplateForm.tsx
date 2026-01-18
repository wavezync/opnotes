import { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@renderer/components/ui/sonner'
import {
  Type,
  Layers,
  Tag,
  Globe,
  User,
  FileText,
  Plus
} from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { TagsInput } from '@renderer/components/ui/tags-input'
import { RichTextEditor } from '@renderer/components/common/RichTextEditor'
import { queries } from '@renderer/lib/queries'
import { cn, unwrapResult } from '@renderer/lib/utils'
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

export interface TemplateFormRef {
  submit: () => void
  isSubmitting: boolean
}

interface TemplateFormProps {
  template?: SurgeryTemplate | null
  onSuccess?: () => void
}

export const TemplateForm = forwardRef<TemplateFormRef, TemplateFormProps>(
  ({ template, onSuccess }, ref) => {
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

    const isSubmitting = createMutation.isPending || updateMutation.isPending

    useImperativeHandle(ref, () => ({
      submit: () => form.handleSubmit(onSubmit)(),
      isSubmitting
    }))

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Template Details Card */}
          <Card className="bg-gradient-to-br from-card to-card/80 overflow-hidden">
            <CardHeader className="pb-4 pt-5 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="flex items-center gap-3 relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center border border-violet-500/20">
                  <FileText className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Template Details</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Basic information about the template
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-5">
              {/* Title */}
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                        <Type className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      <FormLabel className="text-sm font-medium">Title *</FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="e.g., Standard Appendectomy"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category and Tags Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Category */}
                <FormField
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                          <Layers className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <FormLabel className="text-sm font-medium">Category *</FormLabel>
                      </div>
                      <Select onValueChange={handleCategoryChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                          <SelectItem value="__custom__">
                            <span className="flex items-center gap-1">
                              <Plus className="h-3 w-3" />
                              Add custom category
                            </span>
                          </SelectItem>
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
                            className="h-10"
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCustomCategorySubmit}
                            className="h-10"
                          >
                            Add
                          </Button>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags */}
                <Controller
                  name="tags"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                          <Tag className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <FormLabel className="text-sm font-medium">Tags</FormLabel>
                      </div>
                      <FormControl>
                        <TagsInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Press Enter to add"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        e.g., laparoscopic, emergency
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              {/* Scope */}
              <FormItem>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                    <Globe className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <FormLabel className="text-sm font-medium">Scope</FormLabel>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue('scope', 'global')
                      form.setValue('doctorId', null)
                    }}
                    className={cn(
                      'flex-1 flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                      scope === 'global'
                        ? 'border-violet-500 bg-violet-500/5'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <div
                      className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center',
                        scope === 'global' ? 'bg-violet-500/20' : 'bg-muted'
                      )}
                    >
                      <Globe
                        className={cn(
                          'h-4 w-4',
                          scope === 'global' ? 'text-violet-500' : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div className="text-left">
                      <div
                        className={cn(
                          'text-sm font-medium',
                          scope === 'global' ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        Global
                      </div>
                      <div className="text-xs text-muted-foreground">Available to all</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => form.setValue('scope', 'doctor')}
                    className={cn(
                      'flex-1 flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                      scope === 'doctor'
                        ? 'border-violet-500 bg-violet-500/5'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <div
                      className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center',
                        scope === 'doctor' ? 'bg-violet-500/20' : 'bg-muted'
                      )}
                    >
                      <User
                        className={cn(
                          'h-4 w-4',
                          scope === 'doctor' ? 'text-violet-500' : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div className="text-left">
                      <div
                        className={cn(
                          'text-sm font-medium',
                          scope === 'doctor' ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        Doctor-specific
                      </div>
                      <div className="text-xs text-muted-foreground">For one doctor</div>
                    </div>
                  </button>
                </div>
              </FormItem>

              {/* Doctor Select (conditional) */}
              {scope === 'doctor' && (
                <FormField
                  name="doctorId"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <FormLabel className="text-sm font-medium">Doctor</FormLabel>
                      </div>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
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
            </CardContent>
          </Card>

          {/* Content Card */}
          <Card className="bg-gradient-to-br from-card to-card/80 overflow-hidden">
            <CardHeader className="pb-4 pt-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center border border-emerald-500/20">
                  <FileText className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Template Content</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    The text that will be inserted into surgery notes
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Controller
                name="content"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RichTextEditor
                        initialContent={field.value}
                        onUpdate={field.onChange}
                        showTemplateButton={false}
                        editorClassName="border rounded-lg overflow-y-auto min-h-[300px]"
                      />
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

TemplateForm.displayName = 'TemplateForm'
