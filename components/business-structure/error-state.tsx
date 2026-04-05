"use client";

import { useEffect } from "react";

import { useLocaleContext } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ErrorStateProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export function BusinessStructureErrorState({ error, reset }: ErrorStateProps) {
  const { messages } = useLocaleContext();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="border-rose-200 bg-rose-50/60">
      <CardHeader>
        <CardTitle>{messages.app.resourceStates.errorTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0 text-sm leading-7 text-slate-700">
        <p>{messages.app.resourceStates.errorDescription}</p>
        <Button onClick={() => reset()}>{messages.app.resourceStates.retry}</Button>
      </CardContent>
    </Card>
  );
}
