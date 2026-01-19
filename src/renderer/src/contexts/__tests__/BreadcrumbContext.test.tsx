import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import { BreadcrumbProvider, useBreadcrumbs } from '../BreadcrumbContext'

// Test component that uses the breadcrumb context
function TestComponent() {
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs()

  return (
    <div>
      <div data-testid="breadcrumb-count">{breadcrumbs.length}</div>
      <div data-testid="breadcrumbs">
        {breadcrumbs.map((crumb, index) => (
          <span key={index} data-testid={`crumb-${index}`}>
            {crumb.label}
            {crumb.to && ` (${crumb.to})`}
          </span>
        ))}
      </div>
      <button
        data-testid="set-single"
        onClick={() => setBreadcrumbs([{ label: 'Home' }])}
      >
        Set Single
      </button>
      <button
        data-testid="set-multiple"
        onClick={() =>
          setBreadcrumbs([
            { label: 'Home', to: '/' },
            { label: 'Patients', to: '/patients' },
            { label: 'John Doe' }
          ])
        }
      >
        Set Multiple
      </button>
      <button data-testid="clear" onClick={() => setBreadcrumbs([])}>
        Clear
      </button>
    </div>
  )
}

describe('BreadcrumbContext', () => {
  it('should start with empty breadcrumbs', () => {
    render(
      <BreadcrumbProvider>
        <TestComponent />
      </BreadcrumbProvider>
    )

    expect(screen.getByTestId('breadcrumb-count')).toHaveTextContent('0')
  })

  it('should set a single breadcrumb', () => {
    render(
      <BreadcrumbProvider>
        <TestComponent />
      </BreadcrumbProvider>
    )

    act(() => {
      fireEvent.click(screen.getByTestId('set-single'))
    })

    expect(screen.getByTestId('breadcrumb-count')).toHaveTextContent('1')
    expect(screen.getByTestId('crumb-0')).toHaveTextContent('Home')
  })

  it('should set multiple breadcrumbs', () => {
    render(
      <BreadcrumbProvider>
        <TestComponent />
      </BreadcrumbProvider>
    )

    act(() => {
      fireEvent.click(screen.getByTestId('set-multiple'))
    })

    expect(screen.getByTestId('breadcrumb-count')).toHaveTextContent('3')
    expect(screen.getByTestId('crumb-0')).toHaveTextContent('Home (/)')
    expect(screen.getByTestId('crumb-1')).toHaveTextContent('Patients (/patients)')
    expect(screen.getByTestId('crumb-2')).toHaveTextContent('John Doe')
  })

  it('should clear breadcrumbs', () => {
    render(
      <BreadcrumbProvider>
        <TestComponent />
      </BreadcrumbProvider>
    )

    // First set some breadcrumbs
    act(() => {
      fireEvent.click(screen.getByTestId('set-multiple'))
    })

    expect(screen.getByTestId('breadcrumb-count')).toHaveTextContent('3')

    // Then clear them
    act(() => {
      fireEvent.click(screen.getByTestId('clear'))
    })

    expect(screen.getByTestId('breadcrumb-count')).toHaveTextContent('0')
  })

  it('should replace existing breadcrumbs when setting new ones', () => {
    render(
      <BreadcrumbProvider>
        <TestComponent />
      </BreadcrumbProvider>
    )

    // Set multiple first
    act(() => {
      fireEvent.click(screen.getByTestId('set-multiple'))
    })

    expect(screen.getByTestId('breadcrumb-count')).toHaveTextContent('3')

    // Set single - should replace, not append
    act(() => {
      fireEvent.click(screen.getByTestId('set-single'))
    })

    expect(screen.getByTestId('breadcrumb-count')).toHaveTextContent('1')
    expect(screen.getByTestId('crumb-0')).toHaveTextContent('Home')
  })

  describe('useBreadcrumbs hook', () => {
    it('should use default context values when used outside provider', () => {
      // The context has default values, so it won't throw
      // Instead it will use the default (empty breadcrumbs, no-op setBreadcrumbs)
      render(<TestComponent />)

      // Should have empty breadcrumbs from default context
      expect(screen.getByTestId('breadcrumb-count')).toHaveTextContent('0')

      // setBreadcrumbs is a no-op, so clicking won't change anything
      act(() => {
        fireEvent.click(screen.getByTestId('set-single'))
      })

      // Still 0 because setBreadcrumbs is a no-op outside provider
      expect(screen.getByTestId('breadcrumb-count')).toHaveTextContent('0')
    })
  })
})
