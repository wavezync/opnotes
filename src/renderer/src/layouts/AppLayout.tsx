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
      <div className="text-center  flex flex-col md:items-center md:justify-center mb-2">
        <div className="flex flex-row justify-start items-start w-full">
          <Breadcrumbs />
        </div>

        <div className="flex md:flex-row justify-center items-center  flex-col-reverse">
          <SectionTitle title={title} />

          {actions && (
            <div className="md:absolute right-1 space-x-1 justify-end items-end flex w-full">
              {actions}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 p-2 overflow-y-auto">{children}</div>
    </div>
  )
}
