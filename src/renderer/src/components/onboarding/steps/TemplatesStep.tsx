import { FileText, Zap, Clock, Copy } from 'lucide-react'

const benefits = [
  {
    icon: Copy,
    title: 'Create Once, Use Many Times',
    description: 'Define standard procedures and post-op instructions once, then apply them instantly to new surgeries',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    icon: Clock,
    title: 'Save Hours Every Week',
    description: 'Stop retyping the same information. Templates auto-fill surgery notes so you can focus on patient-specific details',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
  {
    icon: Zap,
    title: 'Consistent Documentation',
    description: 'Ensure all surgical notes follow your unit\'s standards with pre-defined templates',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  }
]

export const TemplatesStep = () => {
  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse-soft" />
          <div className="relative h-16 w-16 rounded-xl bg-gradient-primary shadow-theme-primary flex items-center justify-center">
            <FileText className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Surgery Templates</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Save time with reusable templates for common surgical procedures
          </p>
        </div>
      </div>

      {/* Benefits list */}
      <div className="w-full space-y-3">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon
          return (
            <div
              key={benefit.title}
              className="group flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 hover:bg-card transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-10 w-10 rounded-lg ${benefit.bgColor} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${benefit.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold mb-1">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Example preview */}
      <div
        className="w-full p-4 rounded-xl bg-muted/30 border border-border/50 animate-fade-in-up"
        style={{ animationDelay: '300ms' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
            <FileText className="h-3 w-3 text-primary" />
          </div>
          <span className="text-xs font-medium">Example Template</span>
        </div>
        <div className="space-y-2">
          <div className="h-2 w-3/4 bg-muted rounded" />
          <div className="h-2 w-full bg-muted rounded" />
          <div className="h-2 w-5/6 bg-muted rounded" />
          <div className="h-2 w-2/3 bg-muted rounded" />
        </div>
      </div>

      {/* Info note */}
      <p className="text-xs text-muted-foreground text-center">
        Create and manage templates from{' '}
        <span className="text-foreground font-medium">Settings → Templates</span>{' '}
        after completing setup
      </p>
    </div>
  )
}
