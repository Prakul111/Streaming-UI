export function CarouselSkeleton() {
  return (
    <div className="relative flex h-[75vh] min-h-[500px] sm:h-[80vh] sm:min-h-[560px] md:h-[85vh] md:min-h-[680px] max-h-[960px] w-full animate-pulse flex-col justify-end overflow-hidden bg-muted/20 p-4 sm:p-6 lg:p-16 pb-14 sm:pb-16 lg:pb-24">
      <div className="z-20 max-w-xl lg:max-w-2xl space-y-3 sm:space-y-4">
        <div className="flex gap-2">
          <div className="h-5 sm:h-6 w-16 rounded-full bg-muted/40" />
          <div className="h-5 sm:h-6 w-12 rounded-full bg-muted/40" />
          <div className="h-5 sm:h-6 w-20 rounded-full bg-muted/40" />
        </div>
        <div className="h-10 sm:h-14 w-3/4 rounded-xl sm:rounded-2xl bg-muted/40" />
        <div className="space-y-2">
          <div className="h-3.5 sm:h-4 w-full rounded bg-muted/40" />
          <div className="h-3.5 sm:h-4 w-5/6 rounded bg-muted/40" />
        </div>
        <div className="flex gap-3 pt-2 sm:pt-4">
          <div className="h-9 sm:h-10 w-24 sm:w-28 rounded-full bg-muted/40" />
          <div className="h-9 sm:h-10 w-28 sm:w-32 rounded-full bg-muted/40" />
        </div>
      </div>
    </div>
  )
}

export function MovieRowSkeleton() {
  return (
    <div className="flex gap-6 overflow-x-hidden pb-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="w-40 shrink-0 space-y-3">
          <div className="h-[240px] w-40 animate-pulse rounded-2xl border border-border/10 bg-muted/20" />
          <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-muted/20" />
        </div>
      ))}
    </div>
  )
}
