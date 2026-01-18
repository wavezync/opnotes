import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@renderer/components/ui/command'

export interface FilterComboboxItem {
  value: string
  label: string
}

interface FilterComboboxProps {
  items: FilterComboboxItem[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
}

export const FilterCombobox = ({
  items,
  value,
  onChange,
  placeholder,
  searchPlaceholder = 'Search...',
  emptyText = 'No items found.',
  className
}: FilterComboboxProps) => {
  const [open, setOpen] = useState(false)

  const selectedItem = items.find((item) => item.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between text-sm font-normal', className)}
        >
          <span className={cn('truncate', !selectedItem && 'text-muted-foreground')}>
            {selectedItem?.label ?? placeholder}
          </span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {value && (
              <X
                className="h-3 w-3 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(null)
                }}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => {
                    onChange(item.value === value ? null : item.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
