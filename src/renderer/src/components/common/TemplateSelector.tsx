import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Globe, User } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@renderer/components/ui/command'
import { Badge } from '@renderer/components/ui/badge'
import { unwrapResult } from '@renderer/lib/utils'

interface TemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (content: string) => void
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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200)
    return () => clearTimeout(timer)
  }, [search])

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch('')
      setDebouncedSearch('')
    }
  }, [open])

  const { data: templatesGrouped, isLoading } = useQuery({
    queryKey: ['surgeryTemplates', 'forEditor', debouncedSearch],
    queryFn: () =>
      unwrapResult(
        window.api.invoke('searchTemplatesForEditor', {
          search: debouncedSearch || undefined
        })
      ),
    enabled: open
  })

  const categories = useMemo(() => {
    if (!templatesGrouped) return []
    return Object.keys(templatesGrouped).sort()
  }, [templatesGrouped])

  const handleSelect = (content: string) => {
    onSelect(content)
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search templates..." value={search} onValueChange={setSearch} />
      <CommandList className="max-h-[400px]">
        {isLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Loading templates...</div>
        ) : categories.length === 0 ? (
          <CommandEmpty>
            {debouncedSearch
              ? 'No templates found matching your search.'
              : 'No templates available. Create templates in Settings.'}
          </CommandEmpty>
        ) : (
          categories.map((category) => (
            <CommandGroup key={category} heading={category.toUpperCase()}>
              {templatesGrouped?.[category].map((template) => (
                <CommandItem
                  key={template.id}
                  value={`${template.title} ${template.category} ${template.tags.join(' ')}`}
                  onSelect={() => handleSelect(template.content)}
                  className="flex flex-col items-start gap-1 py-3"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{template.title}</span>
                    {template.doctorId === null ? (
                      <span title="Global template">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    ) : (
                      <div
                        className="flex items-center gap-1 text-muted-foreground"
                        title={`Doctor: ${template.doctorName}`}
                      >
                        <User className="h-3.5 w-3.5" />
                        <span className="text-xs">{template.doctorName}</span>
                      </div>
                    )}
                  </div>
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {truncate(stripHtml(template.content), 100)}
                  </p>
                </CommandItem>
              ))}
            </CommandGroup>
          ))
        )}
      </CommandList>
      <div className="border-t px-3 py-2 text-xs text-muted-foreground">
        Type to search &bull; Use arrow keys to navigate &bull; Press Enter to insert
      </div>
    </CommandDialog>
  )
}
