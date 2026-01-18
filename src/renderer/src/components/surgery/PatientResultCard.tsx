import { Patient } from 'src/shared/types/db'
import { cn } from '@renderer/lib/utils'
import { User, Hash, Calendar } from 'lucide-react'

interface PatientResultCardProps {
  patient: Patient
  onSelect: (patient: Patient) => void
  isSelected?: boolean
  className?: string
  style?: React.CSSProperties
}

// Calculate age from birth year
function getAge(birthYear: number): string {
  const currentYear = new Date().getFullYear()
  const age = currentYear - birthYear
  return `${age}y`
}

export function PatientResultCard({
  patient,
  onSelect,
  isSelected,
  className,
  style
}: PatientResultCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(patient)}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-xl border bg-card text-left transition-all duration-200',
        'hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-theme-md',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
        'group',
        isSelected && 'border-emerald-500 bg-emerald-500/10',
        className
      )}
      style={style}
    >
      {/* Patient Avatar */}
      <div
        className={cn(
          'h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
          patient.gender === 'M' ? 'bg-blue-500/10' : 'bg-pink-500/10',
          'group-hover:scale-105'
        )}
      >
        <User
          className={cn(
            'h-5 w-5',
            patient.gender === 'M' ? 'text-blue-500' : 'text-pink-500'
          )}
        />
      </div>

      {/* Patient Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {patient.name}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {patient.phn}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {getAge(patient.birth_year)}
          </span>
          <span
            className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-medium uppercase',
              patient.gender === 'M'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
            )}
          >
            {patient.gender === 'M' ? 'Male' : 'Female'}
          </span>
        </div>
      </div>

      {/* Select Indicator */}
      <div
        className={cn(
          'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200',
          'bg-emerald-500/10 opacity-0 group-hover:opacity-100',
          isSelected && 'opacity-100 bg-emerald-500 text-white'
        )}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4"
          />
        </svg>
      </div>
    </button>
  )
}
