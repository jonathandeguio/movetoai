import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FilterChip = {
  label: string;
  href: Route;
  active: boolean;
};

type FilterOption = {
  label: string;
  value: string;
};

type FilterPanelProps = {
  action: string;
  searchValue: string;
  searchPlaceholder: string;
  selectLabel: string;
  selectName: string;
  selectValue: string;
  selectOptions: FilterOption[];
  chips: FilterChip[];
  submitLabel: string;
  clearLabel: string;
  clearHref: Route;
};

export function BusinessStructureFilterPanel({
  action,
  searchValue,
  searchPlaceholder,
  selectLabel,
  selectName,
  selectValue,
  selectOptions,
  chips,
  submitLabel,
  clearLabel,
  clearHref
}: FilterPanelProps) {
  return (
    <Card className="border-primary/10">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Link key={chip.label} href={chip.href}>
              <Badge
                variant={chip.active ? "default" : "outline"}
                className={cn("cursor-pointer", chip.active ? "" : "hover:border-primary/20")}
              >
                {chip.label}
              </Badge>
            </Link>
          ))}
        </div>

        <form action={action} className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto_auto]">
          <Input name="q" defaultValue={searchValue} placeholder={searchPlaceholder} />
          <div className="space-y-2">
            <Label htmlFor={selectName}>{selectLabel}</Label>
            <select
              id={selectName}
              name={selectName}
              defaultValue={selectValue}
              className="flex h-11 w-full rounded-lg border border-[--border] bg-[--bg-input] px-3 text-sm text-[--text-primary] shadow-sm outline-none transition focus:border-[--border-focus]"
            >
              {selectOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button className="self-end" type="submit">
            {submitLabel}
          </Button>
          <Button className="self-end" variant="outline" asChild>
            <Link href={clearHref}>{clearLabel}</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
