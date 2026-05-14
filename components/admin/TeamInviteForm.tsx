"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoleOption = { code: string; name: string };

type TeamInviteFormProps = {
  availableRoles: RoleOption[];
};

export function TeamInviteForm({ availableRoles }: TeamInviteFormProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [selectedRole, setSelectedRole] = useState(availableRoles.find((r) => r.code === "TRANSFORMATION_MANAGER")?.code ?? availableRoles[0]?.code ?? "TRANSFORMATION_MANAGER");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: number; skipped: number } | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  function addEmail() {
    const trimmed = emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Adresse email invalide.");
      return;
    }
    if (emails.includes(trimmed)) {
      setEmailError("Déjà dans la liste.");
      return;
    }
    if (emails.length >= 10) {
      setEmailError("Maximum 10 invitations à la fois.");
      return;
    }
    setEmails((prev) => [...prev, trimmed]);
    setEmailInput("");
    setEmailError("");
  }

  function removeEmail(email: string) {
    setEmails((prev) => prev.filter((e) => e !== email));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); addEmail(); }
  }

  function handleSubmit() {
    if (emails.length === 0) {
      setError("Ajoutez au moins une adresse email.");
      return;
    }

    startTransition(() => {
      void (async () => {
        setError("");
        setResult(null);

        const res = await fetch("/api/admin/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails, roleCode: selectedRole }),
        });

        const payload = await res.json().catch(() => null) as {
          ok: boolean;
          results?: { status: string }[];
        } | null;

        if (!res.ok || !payload?.ok) {
          if ((payload as { code?: string } | null)?.code === "FORBIDDEN") {
            setError("Vous n'avez pas la permission d'inviter des membres.");
          } else {
            setError("Une erreur est survenue. Réessayez.");
          }
          return;
        }

        const results = payload.results ?? [];
        const success = results.filter((r) => r.status !== "already_member").length;
        const skipped = results.filter((r) => r.status === "already_member").length;

        setResult({ success, skipped });
        setEmails([]);
        router.refresh();
      })();
    });
  }

  const selectClass =
    "flex h-11 w-full rounded-lg border border-[--border] bg-[--bg-input] px-3 text-sm text-[--text-primary] shadow-sm outline-none transition focus:border-[--border-focus]";

  return (
    <Card className="border-[--border]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-4 w-4 text-[--green]" />
          Inviter des membres
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Role select */}
        <div className="space-y-2">
          <Label htmlFor="role-select">Rôle à attribuer</Label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={selectClass}
          >
            {availableRoles.map((r) => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Email input */}
        <div className="space-y-2">
          <Label>Adresses email</Label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="collaborateur@entreprise.fr"
              value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
              onKeyDown={handleKeyDown}
            />
            <Button type="button" variant="outline" size="icon" onClick={addEmail} aria-label="Ajouter">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {emailError && <p className="text-sm text-[--red]">{emailError}</p>}
        </div>

        {/* Email chips */}
        {emails.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {emails.map((email) => (
              <span
                key={email}
                className="flex items-center gap-1.5 rounded-full border border-[--green-border] bg-[--green-dim] px-3 py-1 text-xs font-medium text-[--green]"
              >
                {email}
                <button type="button" onClick={() => removeEmail(email)} aria-label={`Retirer ${email}`} className="hover:text-[--red]">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-[--red-dim] bg-[--red-dim] px-4 py-3 text-sm text-[--red]">{error}</p>
        )}

        {result && (
          <p className="rounded-xl border border-[--green-border] bg-[--green-dim] px-4 py-3 text-sm text-[--green]" role="status">
            ✓ {result.success} invitation{result.success !== 1 ? "s" : ""} envoyée{result.success !== 1 ? "s" : ""}.
            {result.skipped > 0 && ` ${result.skipped} déjà membre(s).`}
          </p>
        )}

        <Button className="w-full" onClick={handleSubmit} disabled={isPending || emails.length === 0}>
          {isPending ? "Envoi…" : `Inviter ${emails.length > 0 ? `(${emails.length})` : ""}`}
        </Button>

        <p className="text-xs text-[--text-muted]">
          Les invités recevront un accès immédiat avec le rôle sélectionné. Un email de bienvenue sera envoyé dès qu'un service d'emailing sera configuré.
        </p>
      </CardContent>
    </Card>
  );
}
