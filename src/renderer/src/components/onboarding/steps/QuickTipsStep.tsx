import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Search, Printer, Users, CalendarCheck, Sparkles } from 'lucide-react'

export const QuickTipsStep = () => {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Quick Tips</h2>
        <p className="text-muted-foreground max-w-md">
          Here are some helpful features to get you started.
        </p>
      </div>

      <div className="grid gap-3 w-full max-w-lg">
        <Card>
          <CardHeader className="py-3 pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Powerful Search
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <CardDescription>
              Quickly find patients and surgeries using full-text search. Search by name, BHT
              number, diagnosis, or procedure.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Printer className="w-4 h-4 text-primary" />
              Print Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <CardDescription>
              Print surgery notes, patient records, and follow-up summaries. Your hospital details
              are automatically included.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Doctor Management
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <CardDescription>
              Maintain a database of doctors. Assign surgeons and assistants to each surgery for
              complete records.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" />
              Follow-up Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <CardDescription>
              Record follow-up visits and track patient progress after surgery. Never lose track of
              post-operative care.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
