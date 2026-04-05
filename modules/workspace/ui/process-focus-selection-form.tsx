"use client";

import type { Route } from "next";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ProcessFocusSelectionFormProps = {
  processes: Array<{
    id: string;
    name: string;
    domainName: string | null;
    ownerName: string | null;
  }>;
  defaultSelectedProcessIds: string[];
  copy: {
    searchPlaceholder: string;
    selectedCountLabel: string;
    continue: string;
    helperText: string;
    emptyTitle: string;
    emptyDescription: string;
    openProcesses: string;
    noSearchResults: string;
    ownerFallback: string;
    errors: {
      invalidSelection: string;
      unexpected: string;
    };
  };
};

export function ProcessFocusSelectionForm({
  processes,
  defaultSelectedProcessIds,
  copy,
}: ProcessFocusSelectionFormProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(defaultSelectedProcessIds);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const normalizedSearch = search.trim().toLowerCase();
  const filteredProcesses = processes.filter((process) =>
    process.name.toLowerCase().includes(normalizedSearch)
  );

  const isComplete = selectedIds.length === 5;

  function toggleSelection(processId: string) {
    setSelectedIds((current) => {
      if (current.includes(processId)) {
        return current.filter((id) => id !== processId);
      }

      if (current.length >= 5) {
        return current;
      }

      return [...current, processId];
    });
  }

  function submitSelection(selectedProcessIds: string[]) {
    startTransition(() => {
      void (async () => {
        setErrorMessage("");

        const response = await fetch("/api/onboarding/process-focus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedProcessIds }),
        });

        const payload = (await response.json().catch(() => null)) as
          | { code?: string; redirectTo?: string }
          | null;

        if (!response.ok) {
          if (
            payload?.code === "INVALID_SELECTION" ||
            payload?.code === "INVALID_PROCESS_SELECTION"
          ) {
            setErrorMessage(copy.errors.invalidSelection);
            return;
          }

          setErrorMessage(copy.errors.unexpected);
          return;
        }

        router.push((payload?.redirectTo ?? "/app") as Route);
        router.refresh();
      })();
    });
  }

  if (processes.length === 0) {
    return (
      <Card className="border-primary/10 shadow-soft">
        <CardContent className="space-y-6 p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              {copy.emptyTitle}
            </h2>
            <p className="text-sm leading-7 text-slate-600">{copy.emptyDescription}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => submitSelection([])}
              type="button"
              disabled={isPending}
            >
              {copy.openProcesses}
            </Button>
          </div>
          {errorMessage ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/10 shadow-soft">
      <CardContent className="space-y-6 p-8">
        <div className="space-y-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.searchPlaceholder}
          />
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-700">{copy.helperText}</p>
            <p className="text-sm font-semibold text-primary-deep">
              {selectedIds.length} / 5 {copy.selectedCountLabel}
            </p>
          </div>
        </div>

        {filteredProcesses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-slate-50 px-4 py-6 text-sm text-slate-600">
            {copy.noSearchResults}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProcesses.map((process) => {
              const isSelected = selectedIds.includes(process.id);
              const selectionLocked = !isSelected && selectedIds.length >= 5;

              return (
                <button
                  key={process.id}
                  type="button"
                  onClick={() => toggleSelection(process.id)}
                  disabled={selectionLocked || isPending}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    isSelected
                      ? "border-primary/30 bg-primary/5 shadow-soft-sm"
                      : "border-border/80 bg-white hover:border-primary/20 hover:bg-slate-50"
                  } ${selectionLocked ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-950">{process.name}</p>
                      <p className="text-sm text-slate-600">
                        {[process.domainName, process.ownerName ?? copy.ownerFallback]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    </div>
                    <div
                      className={`mt-0.5 h-5 w-5 rounded border ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-slate-300 bg-white"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          type="button"
          disabled={!isComplete || isPending}
          onClick={() => submitSelection(selectedIds)}
        >
          {copy.continue}
        </Button>

        {errorMessage ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
