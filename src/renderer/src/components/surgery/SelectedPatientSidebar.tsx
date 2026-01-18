import { Patient } from 'src/shared/types/db'
import { cn } from '@renderer/lib/utils'
import { User, Hash, Calendar, MapPin, Phone, ArrowLeft } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'

interface SelectedPatientSidebarProps {
  patient: Patient
  onChangePatient: () => void
  className?: string
}

// Calculate age from birth year
function getAge(birthYear: number): string {
  const currentYear = new Date().getFullYear()
  const age = currentYear - birthYear
  return `${age}y`
}

export function SelectedPatientSidebar({
  patient,
  onChangePatient,
  className
}: SelectedPatientSidebarProps) {
  return (
    <Card className={cn('sticky top-0 bg-gradient-to-br from-card to-card/80', className)}>
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center',
                patient.gender === 'M' ? 'bg-blue-500/10' : 'bg-pink-500/10'
              )}
            >
              <User
                className={cn(
                  'h-4 w-4',
                  patient.gender === 'M' ? 'text-blue-500' : 'text-pink-500'
                )}
              />
            </div>
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Selected Patient
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onChangePatient}
            className="text-xs h-7"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Change
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Patient Name & Gender Badge */}
        <div>
          <h3 className="text-lg font-semibold truncate">{patient.name}</h3>
          <span
            className={cn(
              'inline-flex px-2 py-0.5 rounded text-xs font-medium mt-1',
              patient.gender === 'M'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
            )}
          >
            {patient.gender === 'M' ? 'Male' : 'Female'}
          </span>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <div className="text-[10px] text-muted-foreground uppercase font-medium">PHN</div>
              <div className="text-sm font-medium truncate">{patient.phn}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Age</div>
              <div className="text-sm font-medium">{getAge(patient.birth_year)}</div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {(patient.address || patient.phone) && (
          <div className="space-y-2 pt-2 border-t">
            {patient.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{patient.address}</span>
              </div>
            )}
            {patient.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{patient.phone}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
