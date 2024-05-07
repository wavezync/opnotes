import { Breadcrumbs } from '@renderer/components/common/Breadcrumbs'
import { SectionTitle } from '@renderer/components/common/SectionHeader'

export interface AppLayoutProps {
  children?: React.ReactNode
  actions?: React.ReactNode
  title: string
}

export const AppLayout = ({ children, actions, title }: AppLayoutProps) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-center relative flex md:items-center md:justify-center mb-2">
        <div className="absolute left-0">
          <Breadcrumbs />
        </div>

        <SectionTitle title={title} />

        {actions && <div className="absolute right-1 space-x-1">{actions}</div>}
      </div>

      <div className="mt-2 p-2 overflow-y-auto">{children}</div>
    </div>
  )
}
