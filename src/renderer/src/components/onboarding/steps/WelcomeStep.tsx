import opNotesLogo from '@renderer/assets/opnotes-logo.png'
import { Stethoscope, Users, FileText, Shield } from 'lucide-react'

const features = [
  {
    icon: Stethoscope,
    title: 'Surgery Management',
    description: 'Complete surgical records with procedures, findings, and post-op notes'
  },
  {
    icon: Users,
    title: 'Patient Records',
    description: 'Comprehensive patient profiles with full medical history'
  },
  {
    icon: FileText,
    title: 'Smart Templates',
    description: 'Reusable templates for common procedures to save time'
  },
  {
    icon: Shield,
    title: 'Secure & Local',
    description: 'All data stored locally on your device for privacy'
  }
]

export const WelcomeStep = () => {
  return (
    <div className="flex flex-col items-center text-center space-y-8">
      {/* Hero section */}
      <div className="space-y-6">
        {/* Logo with glow effect */}
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse-soft" />
          <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-theme-lg flex items-center justify-center">
            <img
              src={opNotesLogo}
              alt="Op Notes"
              className="h-14 w-14 drop-shadow-lg"
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Op Notes
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            A surgical notes management system designed for healthcare professionals
          </p>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              className="group p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-300 text-left animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* CTA hint */}
      <p className="text-sm text-muted-foreground">
        Let&apos;s set up your workspace in just a few steps
      </p>
    </div>
  )
}
