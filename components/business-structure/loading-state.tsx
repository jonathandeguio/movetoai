export function BusinessStructureLoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-border/80 bg-white"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-2xl border border-border/80 bg-white" />
      <div className="h-[28rem] animate-pulse rounded-2xl border border-border/80 bg-white" />
    </div>
  );
}
