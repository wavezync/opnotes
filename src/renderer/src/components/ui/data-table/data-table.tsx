import {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { DataTablePagination } from './pagination'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { FileSearch } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  setPagination?: OnChangeFn<PaginationState>
  pagination?: PaginationState
  rowCount?: number
  isLoading?: boolean
  onRowClick?: (row: Row<TData>) => void
  emptyMessage?: string
  emptyDescription?: string
}

export function DataTable<TData, TValue>({
  columns,
  data = [],
  setPagination,
  pagination = { pageIndex: 0, pageSize: 10 },
  rowCount = 1,
  isLoading,
  onRowClick,
  emptyMessage = 'No results found',
  emptyDescription = 'Try adjusting your search or filters'
}: DataTableProps<TData, TValue>) {
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onPaginationChange: setPagination,
    state: {
      pagination
    },
    rowCount
  })

  const rows = table.getRowModel().rows

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!rows.length) return

      // Only handle if table container or its children are focused
      if (!tableContainerRef.current?.contains(document.activeElement)) return

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault()
          setFocusedRowIndex((prev) => Math.min(prev + 1, rows.length - 1))
          break
        case 'k':
        case 'ArrowUp':
          e.preventDefault()
          setFocusedRowIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (focusedRowIndex >= 0 && focusedRowIndex < rows.length && onRowClick) {
            onRowClick(rows[focusedRowIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setFocusedRowIndex(-1)
          break
      }
    },
    [rows, focusedRowIndex, onRowClick]
  )

  // Register keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Reset focus when data changes
  useEffect(() => {
    setFocusedRowIndex(-1)
  }, [data])

  // Scroll focused row into view
  useEffect(() => {
    if (focusedRowIndex >= 0) {
      const row = tableContainerRef.current?.querySelector(`[data-row-index="${focusedRowIndex}"]`)
      row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [focusedRowIndex])

  return (
    <div className="rounded-md border" ref={tableContainerRef} tabIndex={0}>
      <div className="h-full max-h-[calc(100vh-280px)] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows?.length ? (
              rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  data-row-index={index}
                  className={cn(
                    'cursor-pointer transition-colors',
                    focusedRowIndex === index && 'bg-accent ring-2 ring-primary ring-inset',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => {
                    setFocusedRowIndex(index)
                    onRowClick?.(row)
                  }}
                  onMouseEnter={() => setFocusedRowIndex(index)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-48">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <FileSearch className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-lg">{emptyMessage}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{emptyDescription}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="my-2 mx-1 border-t pt-2">
        <DataTablePagination table={table} isLoading={isLoading} />
      </div>
    </div>
  )
}
