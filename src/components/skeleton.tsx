export function CarouselSkeleton() {
  return (
    <div className="relative flex h-[480px] w-full animate-pulse flex-col justify-end overflow-hidden rounded-3xl border border-border/40 bg-muted/20 p-8 md:p-14">
      <div className="z-20 max-w-2xl space-y-4">
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-muted/30" />
          <div className="h-6 w-12 rounded-full bg-muted/30" />
          <div className="h-6 w-20 rounded-full bg-muted/30" />
        </div>
        <div className="h-14 w-3/4 rounded-2xl bg-muted/30" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-muted/30" />
          <div className="h-4 w-5/6 rounded bg-muted/30" />
          <div className="h-4 w-2/3 rounded bg-muted/30" />
        </div>
        <div className="flex gap-3 pt-4">
          <div className="h-10 w-28 rounded-xl bg-muted/30" />
          <div className="h-10 w-28 rounded-xl bg-muted/30" />
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
