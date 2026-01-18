import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Pencil, Trash2, Globe, User, FileText, Layers } from 'lucide-react'
import { toast } from '@renderer/components/ui/sonner'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@renderer/components/ui/alert-dialog'
import { Badge } from '@renderer/components/ui/badge'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { unwrapResult, cn } from '@renderer/lib/utils'
import { SurgeryTemplate } from 'src/shared/types/db'
import { queries } from '@renderer/lib/queries'

const parseTags = (tags: string | null): string[] => {
  if (!tags) return []
  try {
    return JSON.parse(tags)
  } catch {
    return []
  }
}

const isGlobal = (template: SurgeryTemplate): boolean => {
  return template.doctor_id === null
}

export const TemplatesSettings = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('__all__')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<SurgeryTemplate | null>(null)

  const [debouncedSearch, setDebouncedSearch] = useState('')
  useMemo(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const categoryForQuery = categoryFilter === '__all__' ? undefined : categoryFilter

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['surgeryTemplates', 'list', { search: debouncedSearch, category: categoryForQuery }],
    queryFn: () =>
      unwrapResult(
        window.api.invoke('listSurgeryTemplates', {
          search: debouncedSearch || undefined,
          category: categoryForQuery,
          pageSize: 100
        })
      )
  })

  const { data: categories } = useQuery({
    queryKey: ['surgeryTemplates', 'categories'],
    queryFn: () => unwrapResult(window.api.invoke('getTemplateCategories'))
  })

  const { data: doctorsData } = useQuery({
    ...queries.doctors.list({ pageSize: 100 })
  })

  const doctorsMap = useMemo(() => {
    const map: Record<number, string> = {}
    doctorsData?.data.forEach((d) => {
      map[d.id] = d.name
    })
    return map
  }, [doctorsData])

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return unwrapResult(window.api.invoke('deleteSurgeryTemplateById', id))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['surgeryTemplates'] })
      toast.success('Template deleted successfully')
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const handleAddNew = () => {
    navigate('/settings/templates/add')
  }

  const handleEdit = (template: SurgeryTemplate) => {
    navigate(`/settings/templates/${template.id}/edit`)
  }

  const handleDelete = (template: SurgeryTemplate) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card with Search */}
      <Card className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up overflow-hidden">
        <CardHeader className="pb-4 pt-5 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center border border-violet-500/20">
                <FileText className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Surgery Templates</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pre-defined templates for surgery notes
                </p>
              </div>
            </div>
            <Button
              onClick={handleAddNew}
              variant="gradient"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Template
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Search and Filter Row */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] h-11">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All categories" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates List Card */}
      <Card
        className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
        style={{ animationDelay: '50ms' }}
      >
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Layers className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {templatesData?.total ?? 0} Template{(templatesData?.total ?? 0) !== 1 ? 's' : ''}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : templatesData?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No templates found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                {search
                  ? `No results for "${search}". Try adjusting your search.`
                  : 'Create surgery templates to speed up documentation.'}
              </p>
              {!search && (
                <Button
                  variant="gradient"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={handleAddNew}
                >
                  Create First Template
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {templatesData?.data.map((template, index) => (
                <div
                  key={template.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group animate-fade-in-up'
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{template.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {parseTags(template.tags).slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {parseTags(template.tags).length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{parseTags(template.tags).length - 3} more
                        </span>
                      )}
                      <span className="text-border">•</span>
                      {isGlobal(template) ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          Global
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {template.doctor_id ? doctorsMap[template.doctor_id] || 'Doctor' : 'Doctor'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(template)}
                      title="Edit template"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(template)}
                      title="Delete template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{templateToDelete?.title}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
