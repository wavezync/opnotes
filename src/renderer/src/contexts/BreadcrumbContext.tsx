import { createContext, useContext, useState } from 'react'

export interface Crumb {
  label: string
  to?: string
}

export interface BreadcrumbContextType {
  breadcrumbs: Crumb[]
  setBreadcrumbs: (crumbs: Crumb[]) => void
}

export const BreadcrumbContext = createContext<BreadcrumbContextType>({
  breadcrumbs: [],
  setBreadcrumbs: () => {}
})

export const BreadcrumbProvider = ({ children }: { children: React.ReactNode }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Crumb[]>([])

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export const useBreadcrumbs = () => {
  const context = useContext(BreadcrumbContext)

  if (!context) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider')
  }

  return context
}
