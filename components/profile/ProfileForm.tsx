"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { profileSchema, type ProfileValues } from "@/lib/validations/profile.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileFormProps = {
  defaultValues: ProfileValues;
};

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error" | "email-taken">("idle");

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const onSubmit = (values: ProfileValues) => {
    startTransition(() => {
      void (async () => {
        setStatus("idle");
        const res = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => null) as { code?: string } | null;
          if (payload?.code === "EMAIL_TAKEN") {
            setStatus("email-taken");
          } else {
            setStatus("error");
          }
          return;
        }

        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      })();
    });
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet *</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-[--red]" role="alert">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-sm text-[--red]" role="alert">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Poste / Titre</Label>
          <Input id="jobTitle" placeholder="ex: Directeur des Opérations" {...form.register("jobTitle")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" type="tel" placeholder="+33 6 00 00 00 00" {...form.register("phone")} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>

        {status === "success" && (
          <p className="text-sm font-medium text-[--green]" role="status" aria-live="polite">
            ✓ Profil mis à jour.
          </p>
        )}
        {status === "email-taken" && (
          <p className="text-sm text-[--red]" role="alert">
            Cet email est déjà utilisé par un autre compte.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-[--red]" role="alert">
            Une erreur est survenue. Réessayez.
          </p>
        )}
      </div>
    </form>
  );
}
