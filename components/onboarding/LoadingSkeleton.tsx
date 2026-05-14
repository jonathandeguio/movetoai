"use client";

type LoadingSkeletonProps = {
  title: string;
  subtitle: string;
};

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-[--border] bg-[--bg-card] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded bg-[--border]" />
          <div className="h-4 w-3/4 rounded bg-[--border]" />
          <div className="h-3 w-full rounded bg-[--bg-hover]" />
          <div className="h-3 w-1/3 rounded bg-[--border]" />
        </div>
        <div className="h-5 w-5 shrink-0 rounded border border-[--border] bg-[--bg-hover]" />
      </div>
    </div>
  );
}

export function LoadingSkeleton({ title, subtitle }: LoadingSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-base font-semibold text-[--text-primary]">{title}</p>
        <p className="text-sm text-[--text-muted]">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}
