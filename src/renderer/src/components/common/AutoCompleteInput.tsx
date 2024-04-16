import * as React from 'react'
import { Check, ChevronsUpDown, PlusIcon } from 'lucide-react'

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
import { CommandList } from 'cmdk'

export interface Item {
  value: any
  label: string
}

export interface AutoCompleteInputProps {
  items?: Item[]
  selectedItems?: Item[]
  onItemSelect?: (item: Item) => void
  onAddNewItem?: (item: Partial<Item>) => void
}

export function AutoCompleteInput({
  items,
  selectedItems,
  onAddNewItem,
  onItemSelect
}: AutoCompleteInputProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [currentTypedValue, setCurrentTypedValue] = React.useState('')

  const handleOpenChange = React.useCallback((open: boolean) => {
    setCurrentTypedValue('')
    setOpen(open)
  }, [])

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
          <CommandInput
            placeholder="Search or Add New..."
            onInput={(e) => setCurrentTypedValue(e.currentTarget.value)}
          />
          <CommandList>
            <CommandEmpty>
              {!!currentTypedValue ? (
                <Button variant={'ghost'} className="flex justify-center items-center w-full">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  <strong>{currentTypedValue}</strong>
                </Button>
              ) : (
                'Add a new entry or search...'
              )}
            </CommandEmpty>
            <CommandGroup>
              {items?.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue)
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
