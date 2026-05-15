import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  className?: string;
  contentClassName?: string;
};

export function MetricCard({ label, value, className, contentClassName }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardContent className={contentClassName ?? "space-y-2 p-6"}>
        <p className="text-sm font-medium text-[--text-muted]">{label}</p>
        <p className="text-3xl font-semibold tracking-tight text-[--text-primary]">{value}</p>
      </CardContent>
    </Card>
  );
}
