import { Sparkles, Search, Printer, Users, CalendarCheck, Keyboard } from 'lucide-react'
import { modKey } from '@renderer/lib/platform'

const tips = [
  {
    icon: Search,
    title: 'Powerful Search',
    description: 'Find patients and surgeries instantly by name, BHT, diagnosis, or procedure',
    shortcut: `${modKey} + K`
  },
  {
    icon: Printer,
    title: 'Print Documents',
    description: 'Generate professional surgical notes and reports with one click',
    shortcut: `${modKey} + P`
  },
  {
    icon: Users,
    title: 'Doctor Database',
    description: 'Maintain a complete list of surgeons and assistants for quick assignment',
    shortcut: null
  },
  {
    icon: CalendarCheck,
    title: 'Follow-up Tracking',
    description: 'Record post-operative visits and track patient recovery progress',
    shortcut: null
  }
]

export const QuickTipsStep = () => {
  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse-soft" />
          <div className="relative h-16 w-16 rounded-xl bg-gradient-primary shadow-theme-primary flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Quick Tips</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Here are some powerful features to help you get the most out of Op Notes
          </p>
        </div>
      </div>

      {/* Tips grid */}
      <div className="w-full grid grid-cols-2 gap-3">
        {tips.map((tip, index) => {
          const Icon = tip.icon
          return (
            <div
              key={tip.title}
              className="group p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 hover:bg-card transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                {tip.shortcut && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 border border-border/50">
                    <Keyboard className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-mono text-muted-foreground">{tip.shortcut}</span>
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold mb-1">{tip.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tip.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Keyboard shortcuts hint */}
      <div
        className="w-full p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/10 animate-fade-in-up"
        style={{ animationDelay: '300ms' }}
      >
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-7 min-w-7 px-1.5 rounded-md bg-card border border-border flex items-center justify-center">
              <span className="text-xs font-mono text-muted-foreground">{modKey}</span>
            </div>
            <span className="text-xs text-muted-foreground">+</span>
            <div className="h-7 w-7 rounded-md bg-card border border-border flex items-center justify-center">
              <span className="text-xs font-mono text-muted-foreground">K</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            Open Command Palette for quick actions
          </span>
        </div>
      </div>

      {/* Ready message */}
      <div className="text-center space-y-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <p className="text-sm font-medium text-foreground">
          You&apos;re all set! 🎉
        </p>
        <p className="text-xs text-muted-foreground">
          Click <span className="text-foreground font-medium">&ldquo;Get Started&rdquo;</span> to begin using Op Notes
        </p>
      </div>
    </div>
  )
}
