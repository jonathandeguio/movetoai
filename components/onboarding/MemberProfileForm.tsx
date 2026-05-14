"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Camera, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const schema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis"),
  lastName: z.string().trim().min(1, "Nom requis"),
  jobTitle: z.string().trim().max(120).optional()
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultName?: string;
  workspaceName: string;
}

function AvatarPreview({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = [firstName[0], lastName[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-2xl font-bold text-white shadow-md select-none">
          {initials}
        </div>
        <button
          type="button"
          title="Ajouter une photo (disponible depuis les paramètres)"
          onClick={() => {}}
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[--bg-card] bg-[--bg-hover] text-[--text-muted] shadow-sm transition hover:bg-[--border]"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-xs text-[--text-muted]">
        Photo modifiable depuis les paramètres
      </p>
    </div>
  );
}

export function MemberProfileForm({ defaultName = "", workspaceName }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const parts = defaultName.trim().split(" ");
  const defaultFirst = parts[0] ?? "";
  const defaultLast = parts.slice(1).join(" ");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: defaultFirst,
      lastName: defaultLast,
      jobTitle: ""
    }
  });

  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");

  function onSubmit(values: FormValues) {
    startTransition(() => {
      void (async () => {
        setError("");
        const res = await fetch("/api/onboarding/member-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });

        if (!res.ok) {
          setError("Une erreur est survenue. Veuillez réessayer.");
          return;
        }

        router.push("/app/dashboard/member");
        router.refresh();
      })();
    });
  }

  return (
    <Card className="border-[--border] shadow-sm">
      <CardContent className="space-y-6 p-8">
        {/* Avatar preview — updates live as name is typed */}
        <AvatarPreview firstName={firstName} lastName={lastName} />

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input id="firstName" {...form.register("firstName")} placeholder="Alice" />
              {form.formState.errors.firstName && (
                <p className="text-xs text-[--red]">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom *</Label>
              <Input id="lastName" {...form.register("lastName")} placeholder="Dupont" />
              {form.formState.errors.lastName && (
                <p className="text-xs text-[--red]">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="jobTitle">
              Poste <span className="text-[--text-muted]">(optionnel)</span>
            </Label>
            <Input
              id="jobTitle"
              {...form.register("jobTitle")}
              placeholder="ex : Comptable, Assistant RH, Commercial…"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-[--red-dim] bg-[--red-dim] px-4 py-3 text-sm text-[--red]">
              {error}
            </p>
          )}

          <Button className="w-full" size="lg" type="submit" disabled={isPending}>
            {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement…</>
            ) : (
              <>Accéder à mon espace <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-[--text-muted]">
          Workspace : <span className="font-medium text-[--text-secondary]">{workspaceName}</span>
        </p>
      </CardContent>
    </Card>
  );
}
