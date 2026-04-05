import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DetailSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function DetailSection({ title, description, children }: DetailSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4 pt-0">{children}</CardContent>
    </Card>
  );
}
