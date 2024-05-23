import { cn, trim } from '@renderer/lib/utils'

export const SectionHeader = ({ title, className }: { title: string; className?: string }) => (
  <h2 className={cn('font-bold text-xl', className)}>{title}</h2>
)

export const SectionTitle = ({ title, className }: { title: string; className?: string }) => (
  <h1
    className={cn('font-bold w-full text-center text-2xl truncate overflow-hidden', className)}
    title={title}
  >
    {trim(title, 50)}
  </h1>
)
