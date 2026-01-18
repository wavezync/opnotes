import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Globe, User, Search } from 'lucide-react'
import { Dialog, DialogContent } from '@renderer/components/ui/dialog'
import { Badge } from '@renderer/components/ui/badge'
import { Input } from '@renderer/components/ui/input'
import { FilterCombobox, FilterComboboxItem } from './FilterCombobox'
import { queries } from '@renderer/lib/queries'
import { cn } from '@renderer/lib/utils'

interface TemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (content: string) => void
}

interface TemplateItem {
  id: number
  title: string
  content: string
  category: string
  tags: string[]
  doctorId: number | null
  doctorName: string | null
}

// Strip HTML tags for preview
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// Truncate text for preview
const truncate = (text: string, maxLength: number): string => {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.substring(0, maxLength) + '...'
}

export const TemplateSelector = ({ open, onOpenChange, onSelect }: TemplateSelectorProps) => {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [doctorFilter, setDoctorFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200)
    return () => clearTimeout(timer)
  }, [search])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch('')
      setDebouncedSearch('')
      setCategoryFilter(null)
      setDoctorFilter(null)
      setTagFilter(null)
      setSelectedIndex(0)
    }
  }, [open])

  // Fetch templates with filters
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    ...queries.surgeryTemplates.forEditor({
      search: debouncedSearch || undefined,
      category: categoryFilter || undefined,
      doctorId: doctorFilter ? parseInt(doctorFilter, 10) : undefined,
      tag: tagFilter || undefined
    }),
    enabled: open
  })

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    ...queries.surgeryTemplates.categories,
    enabled: open
  })

  // Fetch tags for filter
  const { data: tags = [] } = useQuery({
    ...queries.surgeryTemplates.tags,
    enabled: open
  })

  // Fetch doctors for filter
  const { data: doctorsResult } = useQuery({
    ...queries.doctors.list({ pageSize: 100 }),
    enabled: open
  })

  // Transform data for filter comboboxes
  const categoryItems: FilterComboboxItem[] = useMemo(
    () => categories.map((c: string) => ({ value: c, label: c })),
    [categories]
  )

  const tagItems: FilterComboboxItem[] = useMemo(
    () => tags.map((t: string) => ({ value: t, label: t })),
    [tags]
  )

  const doctorItems: FilterComboboxItem[] = useMemo(
    () =>
      doctorsResult?.data?.map((d: { id: number; name: string }) => ({
        value: String(d.id),
        label: d.name
      })) || [],
    [doctorsResult]
  )

  // Reset selected index when templates change
  useEffect(() => {
    setSelectedIndex(0)
  }, [templates])

  const selectedTemplate: TemplateItem | null = templates[selectedIndex] || null

  const handleSelect = useCallback(
    (content: string) => {
      onSelect(content)
      onOpenChange(false)
    },
    [onSelect, onOpenChange]
  )

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, templates.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && selectedTemplate) {
        e.preventDefault()
        handleSelect(selectedTemplate.content)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, templates.length, selectedTemplate, handleSelect])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden h-[600px] flex flex-col">
        {/* Search input */}
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-11 w-full rounded-none border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
          <FilterCombobox
            items={categoryItems}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="Category"
            searchPlaceholder="Search categories..."
            emptyText="No categories found."
            className="w-[140px] h-8"
          />
          <FilterCombobox
            items={doctorItems}
            value={doctorFilter}
            onChange={setDoctorFilter}
            placeholder="Doctor"
            searchPlaceholder="Search doctors..."
            emptyText="No doctors found."
            className="w-[160px] h-8"
          />
          <FilterCombobox
            items={tagItems}
            value={tagFilter}
            onChange={setTagFilter}
            placeholder="Tag"
            searchPlaceholder="Search tags..."
            emptyText="No tags found."
            className="w-[140px] h-8"
          />
        </div>

        {/* Main content area */}
        <div className="flex flex-1 min-h-0">
          {/* Template list */}
          <div className="w-[40%] border-r flex flex-col">
            <div ref={listRef} className="flex-1 overflow-y-auto">
              {templatesLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading templates...
                </div>
              ) : templates.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {debouncedSearch || categoryFilter || doctorFilter || tagFilter
                    ? 'No templates found matching your filters.'
                    : 'No templates available. Create templates in Settings.'}
                </div>
              ) : (
                <div className="p-2">
                  {templates.map((template: TemplateItem, index: number) => (
                    <div
                      key={template.id}
                      ref={index === selectedIndex ? selectedRef : null}
                      className={cn(
                        'p-3 rounded-md cursor-pointer transition-colors mb-1',
                        index === selectedIndex
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-muted'
                      )}
                      onClick={() => setSelectedIndex(index)}
                      onDoubleClick={() => handleSelect(template.content)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{template.title}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {template.category}
                          </Badge>
                          {template.doctorId === null ? (
                            <span title="Global template">
                              <Globe className="h-3 w-3 text-muted-foreground" />
                            </span>
                          ) : (
                            <span title={`Doctor: ${template.doctorName}`}>
                              <User className="h-3 w-3 text-muted-foreground" />
                            </span>
                          )}
                        </div>
                      </div>
                      {template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs px-1.5 py-0 font-normal"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0 font-normal">
                              +{template.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {truncate(stripHtml(template.content), 80)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview panel */}
          <div className="w-[60%] flex flex-col">
            <div className="px-4 py-2 border-b bg-muted/30">
              <h3 className="text-sm font-medium">Template Preview</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {selectedTemplate ? (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold">{selectedTemplate.title}</h4>
                    <Badge variant="outline">{selectedTemplate.category}</Badge>
                  </div>
                  {selectedTemplate.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {selectedTemplate.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {selectedTemplate.doctorName && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <User className="h-3.5 w-3.5" />
                      <span>{selectedTemplate.doctorName}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none template-preview"
                      dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Select a template to preview
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 text-xs text-muted-foreground bg-muted/30">
          Type to search &bull; Use arrow keys to navigate &bull; Press Enter to insert &bull;
          Double-click to insert
        </div>
      </DialogContent>
    </Dialog>
  )
}
