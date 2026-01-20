import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { AlertTriangle, Home, RefreshCw, FileWarning, ServerCrash } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { IconBox } from '../layouts/IconBox'

export default function ErrorPage() {
  const error = useRouteError() as Error | Response | unknown
  console.error(error)

  // Determine error type and message
  let errorMessage = 'An unexpected error occurred'
  let errorTitle = 'Something went wrong'
  let errorCode: string | number | null = null
  let ErrorIcon = AlertTriangle

  if (isRouteErrorResponse(error)) {
    errorCode = error.status
    errorMessage = error.statusText || error.data?.message || 'Route error'

    if (error.status === 404) {
      errorTitle = 'Page not found'
      errorMessage = "The page you're looking for doesn't exist or has been moved."
      ErrorIcon = FileWarning
    } else if (error.status >= 500) {
      errorTitle = 'Server error'
      ErrorIcon = ServerCrash
    }
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl animate-pulse-soft" />
            <IconBox icon={ErrorIcon} color="rose" size="xl" className="relative h-16 w-16" />
          </div>
        </div>

        {/* Error Card */}
        <Card className="bg-gradient-to-br from-card to-card/80 border-rose-500/20">
          <CardContent className="p-6 text-center space-y-4">
            {/* Error Code Badge */}
            {errorCode && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-medium">
                Error {errorCode}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight">{errorTitle}</h1>

            {/* Message */}
            <p className="text-sm text-muted-foreground">{errorMessage}</p>

            {/* Technical Details (collapsible for developers) */}
            {error instanceof Error && error.stack && (
              <details className="text-left mt-4">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  Technical details
                </summary>
                <pre className="mt-2 p-3 bg-muted/50 rounded-lg text-xs font-mono text-muted-foreground overflow-auto max-h-32">
                  {error.stack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleReload}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Try Again
              </Button>
              <Button variant="gradient" className="flex-1" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  )
}
