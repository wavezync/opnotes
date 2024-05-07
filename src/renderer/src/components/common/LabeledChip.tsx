export const LabeledChip = ({
  label,
  value
}: {
  label: React.ReactNode
  value: React.ReactNode
}) => (
  <div className="flex items-center justify-center">
    <span className="font-semibold">{label}:</span>
    <span className="text-accent-foreground bg-secondary rounded-sm py-0.5 px-2 ml-2 hover:bg-secondary/80 transition-colors">
      {value}
    </span>
  </div>
)
