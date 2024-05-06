import {
  ColumnDef,
  OnChangeFn,
  PaginationState,
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  setPagination?: OnChangeFn<PaginationState>
  pagination?: PaginationState
  rowCount?: number
  isLoading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data = [],
  setPagination,
  pagination = { pageIndex: 0, pageSize: 10 },
  rowCount = 1,
  isLoading
}: DataTableProps<TData, TValue>) {
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

  return (
    <div className="rounded-md border">
      <div className="h-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="my-2 mx-1">
        <DataTablePagination table={table} isLoading={isLoading} />
      </div>
    </div>
  )
}
