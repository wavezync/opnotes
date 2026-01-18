import hero from '@renderer/assets/hero.svg?asset'

export const WelcomeStep = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <img src={hero} alt="Op Notes" className="w-48 h-48" />
      <h1 className="text-4xl font-bold">Welcome to Op Notes</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        A surgical notes management application designed to help you efficiently manage patient
        records, surgery notes, and follow-up care.
      </p>
      <div className="text-sm text-muted-foreground">
        Let&apos;s get started by setting up your hospital information.
      </div>
    </div>
  )
}
