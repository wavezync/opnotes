import { Skeleton } from '@renderer/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@renderer/components/ui/card'

interface CardSkeletonProps {
  hasHeader?: boolean
  hasDescription?: boolean
  lines?: number
}

export function CardSkeleton({ hasHeader = true, hasDescription = false, lines = 3 }: CardSkeletonProps) {
  return (
    <Card>
      {hasHeader && (
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-1/3" />
          {hasDescription && <Skeleton className="h-3 w-1/2 mt-1" />}
        </CardHeader>
      )}
      <CardContent className={hasHeader ? '' : 'pt-6'}>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4"
              style={{
                width: `${Math.random() * 30 + 60}%`,
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}
