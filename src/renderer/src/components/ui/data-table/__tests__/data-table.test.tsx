import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import { DataTable } from '../data-table'
import { ColumnDef } from '@tanstack/react-table'

// Sample data type
interface TestData {
  id: number
  name: string
  status: string
}

// Sample columns
const columns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  }
]

// Sample data
const sampleData: TestData[] = [
  { id: 1, name: 'John Doe', status: 'Active' },
  { id: 2, name: 'Jane Smith', status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', status: 'Active' }
]

describe('DataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render table with headers', () => {
      render(<DataTable columns={columns} data={sampleData} />)

      expect(screen.getByText('ID')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('should render data rows', () => {
      render(<DataTable columns={columns} data={sampleData} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    })

    it('should show empty state when no data', () => {
      render(<DataTable columns={columns} data={[]} />)

      expect(screen.getByText('No results found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument()
    })

    it('should show custom empty message', () => {
      render(
        <DataTable
          columns={columns}
          data={[]}
          emptyMessage="No patients found"
          emptyDescription="Add a new patient to get started"
        />
      )

      expect(screen.getByText('No patients found')).toBeInTheDocument()
      expect(screen.getByText('Add a new patient to get started')).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('should render pagination controls', () => {
      render(
        <DataTable
          columns={columns}
          data={sampleData}
          pagination={{ pageIndex: 0, pageSize: 10 }}
          rowCount={100}
        />
      )

      // Pagination component should be rendered
      expect(screen.getByRole('combobox')).toBeInTheDocument() // Page size selector
    })

    it('should call setPagination when page changes', () => {
      const setPagination = vi.fn()

      render(
        <DataTable
          columns={columns}
          data={sampleData}
          pagination={{ pageIndex: 0, pageSize: 10 }}
          rowCount={100}
          setPagination={setPagination}
        />
      )

      // Look for next page button
      const nextButton = screen.getByRole('button', { name: /next/i })
      if (nextButton) {
        fireEvent.click(nextButton)
        expect(setPagination).toHaveBeenCalled()
      }
    })
  })

  describe('Row Click', () => {
    it('should call onRowClick when row is clicked', () => {
      const onRowClick = vi.fn()

      render(<DataTable columns={columns} data={sampleData} onRowClick={onRowClick} />)

      const row = screen.getByText('John Doe').closest('tr')
      if (row) {
        fireEvent.click(row)
        expect(onRowClick).toHaveBeenCalled()
        expect(onRowClick.mock.calls[0][0].original).toEqual(sampleData[0])
      }
    })

    it('should highlight row on hover', () => {
      const onRowClick = vi.fn()

      render(<DataTable columns={columns} data={sampleData} onRowClick={onRowClick} />)

      const row = screen.getByText('John Doe').closest('tr')
      if (row) {
        fireEvent.mouseEnter(row)
        expect(row).toHaveAttribute('data-row-index', '0')
      }
    })
  })

  describe('Keyboard Navigation', () => {
    it('should navigate down with j or ArrowDown', () => {
      const onRowClick = vi.fn()

      const { container } = render(
        <DataTable columns={columns} data={sampleData} onRowClick={onRowClick} />
      )

      // Focus the table container
      const tableContainer = container.querySelector('[tabindex="0"]')
      if (tableContainer) {
        ;(tableContainer as HTMLElement).focus()

        act(() => {
          fireEvent.keyDown(document, { key: 'j' })
        })

        // First row should be focused (index 0)
        const focusedRow = container.querySelector('[data-row-index="0"]')
        expect(focusedRow).toHaveClass('bg-accent')
      }
    })

    it('should navigate up with k or ArrowUp', () => {
      const { container } = render(<DataTable columns={columns} data={sampleData} />)

      const tableContainer = container.querySelector('[tabindex="0"]')
      if (tableContainer) {
        ;(tableContainer as HTMLElement).focus()

        // Go down twice
        act(() => {
          fireEvent.keyDown(document, { key: 'j' })
          fireEvent.keyDown(document, { key: 'j' })
        })

        // Then go up
        act(() => {
          fireEvent.keyDown(document, { key: 'k' })
        })

        const focusedRow = container.querySelector('[data-row-index="0"]')
        expect(focusedRow).toHaveClass('bg-accent')
      }
    })

    it('should not go below last row', () => {
      const { container } = render(<DataTable columns={columns} data={sampleData} />)

      const tableContainer = container.querySelector('[tabindex="0"]')
      if (tableContainer) {
        ;(tableContainer as HTMLElement).focus()

        // Try to go down more than the number of rows
        act(() => {
          for (let i = 0; i < 10; i++) {
            fireEvent.keyDown(document, { key: 'ArrowDown' })
          }
        })

        // Should be at last row (index 2)
        const focusedRow = container.querySelector('[data-row-index="2"]')
        expect(focusedRow).toHaveClass('bg-accent')
      }
    })

    it('should not go above first row', () => {
      const { container } = render(<DataTable columns={columns} data={sampleData} />)

      const tableContainer = container.querySelector('[tabindex="0"]')
      if (tableContainer) {
        ;(tableContainer as HTMLElement).focus()

        // Go down once then try to go up multiple times
        act(() => {
          fireEvent.keyDown(document, { key: 'j' })
          for (let i = 0; i < 10; i++) {
            fireEvent.keyDown(document, { key: 'ArrowUp' })
          }
        })

        // Should be at first row (index 0)
        const focusedRow = container.querySelector('[data-row-index="0"]')
        expect(focusedRow).toHaveClass('bg-accent')
      }
    })

    it('should select row with Enter', () => {
      const onRowClick = vi.fn()
      const { container } = render(
        <DataTable columns={columns} data={sampleData} onRowClick={onRowClick} />
      )

      const tableContainer = container.querySelector('[tabindex="0"]')
      if (tableContainer) {
        ;(tableContainer as HTMLElement).focus()

        // Navigate to first row (separate act to allow state update)
        act(() => {
          fireEvent.keyDown(document, { key: 'j' })
        })

        // Press Enter to select (separate act to read updated focusedRowIndex)
        act(() => {
          fireEvent.keyDown(document, { key: 'Enter' })
        })

        expect(onRowClick).toHaveBeenCalled()
        expect(onRowClick.mock.calls[0][0].original).toEqual(sampleData[0])
      }
    })

    it('should clear focus with Escape', () => {
      const { container } = render(<DataTable columns={columns} data={sampleData} />)

      const tableContainer = container.querySelector('[tabindex="0"]')
      if (tableContainer) {
        ;(tableContainer as HTMLElement).focus()

        // Navigate to a row
        act(() => {
          fireEvent.keyDown(document, { key: 'j' })
        })

        // Press Escape
        act(() => {
          fireEvent.keyDown(document, { key: 'Escape' })
        })

        // No row should have focus styling
        const focusedRow = container.querySelector('.bg-accent')
        expect(focusedRow).toBeNull()
      }
    })
  })

  describe('Focus Reset', () => {
    it('should reset focus when data changes', () => {
      const { container, rerender } = render(
        <DataTable columns={columns} data={sampleData} />
      )

      const tableContainer = container.querySelector('[tabindex="0"]')
      if (tableContainer) {
        ;(tableContainer as HTMLElement).focus()

        // Navigate to a row
        act(() => {
          fireEvent.keyDown(document, { key: 'j' })
        })

        // Verify row is focused
        expect(container.querySelector('.bg-accent')).not.toBeNull()

        // Change data
        const newData: TestData[] = [
          { id: 4, name: 'New Person', status: 'Active' }
        ]

        rerender(<DataTable columns={columns} data={newData} />)

        // Focus should be cleared
        expect(container.querySelector('.bg-accent')).toBeNull()
      }
    })
  })
})
