import { Check, PlusIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CommandList, CommandLoading, CommandSeparator } from 'cmdk'
import { useCallback, useState } from 'react'
import { Progress } from '../ui/progress'

export interface Item {
  value: any
  label: string
}

export interface AutoCompleteInputProps {
  items?: Item[]
  selectedItems?: Item[]
  onItemSelected?: (item: Item) => void
  onSelectedItemsChange?: (items: Item[]) => void
  onAddNewItem?: () => void
  multiple?: boolean
  onSearchChange?: (value: string) => void
  isLoading?: boolean
  placeholder?: string
}

export function AutoCompleteInput({
  items,
  selectedItems,
  onAddNewItem,
  onItemSelected,
  onSelectedItemsChange,
  multiple,
  onSearchChange,
  placeholder = 'Search or Add New...',
  isLoading
}: AutoCompleteInputProps) {
  const [open, setOpen] = useState(false)
  const [currentTypedValue, setCurrentTypedValue] = useState('')

  const isSelected = (value: any) => {
    return selectedItems?.some((item) => item.value === value)
  }

  const handleOpenChange = useCallback((open: boolean) => {
    setCurrentTypedValue('')
    setOpen(open)
  }, [])

  const handleOnSearchChange = useCallback(
    (value: string) => {
      setCurrentTypedValue(value)
      onSearchChange?.(value)
    },
    [onSearchChange]
  )

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          Search or Add New...
          <PlusIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" avoidCollisions side="bottom" align="start">
        <Command>
          <CommandInput placeholder={placeholder} onValueChange={handleOnSearchChange} />
          {isLoading && (
            <CommandLoading>
              <Progress className="h-1 animate-pulse" />
            </CommandLoading>
          )}
          <CommandList>
            <CommandEmpty>
              No results found for <strong>{currentTypedValue}</strong>
              <div className="mt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onAddNewItem?.()
                    setOpen(false)
                  }}
                >
                  Add New Entry
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup className="max-h-48 overflow-y-auto">
              {items?.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(_currentValue) => {
                    if (multiple) {
                      onItemSelected?.(item)
                      if (isSelected(item.value)) {
                        onSelectedItemsChange?.(
                          selectedItems?.filter((i) => i.value !== item.value) || []
                        )
                      } else {
                        onSelectedItemsChange?.([...(selectedItems || []), item])
                      }
                    } else {
                      onItemSelected?.(item)
                      setOpen(false)
                    }
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      isSelected(item.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => onAddNewItem?.()} key={'add-new'}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add New Entry
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
