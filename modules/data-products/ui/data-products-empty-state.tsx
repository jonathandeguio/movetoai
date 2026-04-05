interface DataProductsEmptyStateProps {
  title?: string;
  description?: string;
}

export function DataProductsEmptyState({
  title = "No data products yet",
  description = "Start by defining the data products that support your priority processes and AI opportunities.",
}: DataProductsEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
          Data Products
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}
