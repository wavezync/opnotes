import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Pencil, Trash2, Globe, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
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
import { unwrapResult } from '@renderer/lib/utils'
import { SurgeryTemplate } from 'src/shared/types/db'
import { queries } from '@renderer/lib/queries'

// Helper functions for plain objects (IPC serializes class instances to plain objects)
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

  // Debounce search
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Templates</h2>
        <Button onClick={handleAddNew} leftIcon={<Plus className="h-4 w-4" />}>
          Add Template
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All categories" />
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

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : templatesData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No templates found. Click &quot;Add Template&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              templatesData?.data.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.title}</TableCell>
                  <TableCell>{template.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {parseTags(template.tags).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isGlobal(template) ? (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span className="text-sm">Global</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="text-sm">
                          {template.doctor_id
                            ? doctorsMap[template.doctor_id] || 'Doctor'
                            : 'Doctor'}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(template)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(template)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
