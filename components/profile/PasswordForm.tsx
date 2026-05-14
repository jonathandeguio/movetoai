"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { passwordSchema, type PasswordValues } from "@/lib/validations/profile.schema";
import { PasswordStrengthIndicator } from "@/components/profile/PasswordStrengthIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error" | "wrong-current">("idle");
  const router = useRouter();

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPwd = form.watch("newPassword");

  const onSubmit = (values: PasswordValues) => {
    startTransition(() => {
      void (async () => {
        setStatus("idle");
        const res = await fetch("/api/user/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => null) as { code?: string } | null;
          if (payload?.code === "WRONG_CURRENT_PASSWORD") {
            setStatus("wrong-current");
            form.setError("currentPassword", { message: "Mot de passe actuel incorrect." });
          } else {
            setStatus("error");
          }
          return;
        }

        setStatus("success");
        form.reset();
        // After password change, force re-login
        setTimeout(() => {
          router.push("/login?logout=true");
          router.refresh();
        }, 1500);
      })();
    });
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Mot de passe actuel *</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          aria-describedby={form.formState.errors.currentPassword ? "cur-pwd-error" : undefined}
          {...form.register("currentPassword")}
        />
        {form.formState.errors.currentPassword && (
          <p id="cur-pwd-error" className="text-sm text-[--red]" role="alert">
            {form.formState.errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          aria-describedby="new-pwd-strength"
          {...form.register("newPassword")}
        />
        <div id="new-pwd-strength">
          <PasswordStrengthIndicator password={newPwd} />
        </div>
        {form.formState.errors.newPassword && (
          <p className="text-sm text-[--red]" role="alert">
            {form.formState.errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe *</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-describedby={form.formState.errors.confirmPassword ? "confirm-pwd-error" : undefined}
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword && (
          <p id="confirm-pwd-error" className="text-sm text-[--red]" role="alert">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Changer le mot de passe"}
        </Button>

        {status === "success" && (
          <p className="text-sm font-medium text-[--green]" role="status" aria-live="polite">
            ✓ Mot de passe mis à jour. Reconnexion…
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
