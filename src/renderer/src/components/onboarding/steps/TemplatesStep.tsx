import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { FileText, Copy, Clock } from 'lucide-react'

export const TemplatesStep = () => {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
        <FileText className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Surgery Templates</h2>
        <p className="text-muted-foreground max-w-md">
          Save time by creating reusable templates for common surgical procedures.
        </p>
      </div>

      <div className="grid gap-4 w-full max-w-lg">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Create Once, Use Many Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Define standard procedures, pre-op preparations, and post-op instructions once. Apply
              them to new surgeries with a single click.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Reduce Documentation Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Stop retyping the same information. Templates auto-fill surgery notes, letting you
              focus on patient-specific details.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-md">
        You can create and manage templates from Settings → Templates after completing setup.
      </p>
    </div>
  )
}
