import { cn } from '@renderer/lib/utils'

interface OpNotesLogoProps {
  className?: string
  size?: number
}

export function OpNotesLogo({ className, size = 24 }: OpNotesLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('', className)}
    >
      {/* Clipboard base */}
      <rect
        x="6"
        y="4"
        width="20"
        height="24"
        rx="3"
        fill="currentColor"
        fillOpacity="0.15"
      />

      {/* Clipboard inner */}
      <rect
        x="8"
        y="8"
        width="16"
        height="18"
        rx="2"
        fill="currentColor"
        fillOpacity="0.3"
      />

      {/* Clipboard clip */}
      <rect
        x="12"
        y="2"
        width="8"
        height="5"
        rx="1.5"
        fill="currentColor"
      />
      <rect
        x="14"
        y="4"
        width="4"
        height="2"
        rx="1"
        fill="currentColor"
        fillOpacity="0.3"
      />

      {/* Surgical scalpel / pen - angled writing instrument */}
      <path
        d="M22 12L13 21L11.5 22.5C11 23 10 23 10 22C10 21 11 20 11.5 19.5L20.5 10.5L22 12Z"
        fill="currentColor"
      />

      {/* Scalpel blade highlight */}
      <path
        d="M20.5 10.5L22 12L24 10C24.5 9.5 24.5 8.5 24 8C23.5 7.5 22.5 7.5 22 8L20.5 10.5Z"
        fill="currentColor"
      />

      {/* Note lines */}
      <rect
        x="10"
        y="11"
        width="6"
        height="1.5"
        rx="0.75"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <rect
        x="10"
        y="14.5"
        width="4"
        height="1.5"
        rx="0.75"
        fill="currentColor"
        fillOpacity="0.5"
      />
    </svg>
  )
}

export function OpNotesLogoFilled({ className, size = 24 }: OpNotesLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('', className)}
    >
      {/* Background circle */}
      <circle cx="16" cy="16" r="14" fill="currentColor" fillOpacity="0.1" />

      {/* Clipboard */}
      <rect
        x="9"
        y="7"
        width="14"
        height="18"
        rx="2"
        fill="currentColor"
      />

      {/* Clipboard clip */}
      <rect
        x="12"
        y="5"
        width="8"
        height="4"
        rx="1.5"
        fill="currentColor"
      />
      <rect
        x="13.5"
        y="6.5"
        width="5"
        height="1.5"
        rx="0.75"
        fill="currentColor"
        fillOpacity="0.3"
      />

      {/* Inner document area */}
      <rect
        x="11"
        y="11"
        width="10"
        height="12"
        rx="1"
        fill="currentColor"
        fillOpacity="0.2"
      />

      {/* Medical cross */}
      <rect x="14.5" y="13" width="3" height="8" rx="0.5" fill="currentColor" fillOpacity="0.4" />
      <rect x="12.5" y="15.5" width="7" height="3" rx="0.5" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}

export function OpNotesLogoMinimal({ className, size = 24 }: OpNotesLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('', className)}
    >
      {/* Heartbeat line forming an 'O' shape with pulse */}
      <path
        d="M6 16H10L12 12L14 20L16 8L18 24L20 14L22 16H26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Subtle pen/writing indicator */}
      <circle cx="26" cy="16" r="2" fill="currentColor" />
    </svg>
  )
}
