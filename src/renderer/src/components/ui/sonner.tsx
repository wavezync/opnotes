import { Toaster as Sonner, toast } from 'sonner'
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      expand={false}
      richColors
      closeButton
      gap={8}
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-theme-lg group-[.toaster]:rounded-xl group-[.toaster]:p-4',
          title: 'group-[.toast]:font-semibold group-[.toast]:text-sm',
          description: 'group-[.toast]:text-muted-foreground group-[.toast]:text-xs',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:font-medium group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:font-medium group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5',
          closeButton:
            'group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted group-[.toast]:hover:text-foreground',
          success:
            'group-[.toaster]:bg-emerald-500/10 group-[.toaster]:border-emerald-500/20 group-[.toaster]:text-emerald-600 dark:group-[.toaster]:text-emerald-400 [&>div>svg]:text-emerald-500',
          error:
            'group-[.toaster]:bg-destructive/10 group-[.toaster]:border-destructive/20 group-[.toaster]:text-destructive [&>div>svg]:text-destructive',
          warning:
            'group-[.toaster]:bg-amber-500/10 group-[.toaster]:border-amber-500/20 group-[.toaster]:text-amber-600 dark:group-[.toaster]:text-amber-400 [&>div>svg]:text-amber-500',
          info: 'group-[.toaster]:bg-blue-500/10 group-[.toaster]:border-blue-500/20 group-[.toaster]:text-blue-600 dark:group-[.toaster]:text-blue-400 [&>div>svg]:text-blue-500',
          loading:
            'group-[.toaster]:bg-muted/50 group-[.toaster]:border-border [&>div>svg]:text-primary'
        }
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5" />,
        error: <XCircle className="h-5 w-5" />,
        warning: <AlertCircle className="h-5 w-5" />,
        info: <Info className="h-5 w-5" />,
        loading: <Loader2 className="h-5 w-5 animate-spin" />
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
