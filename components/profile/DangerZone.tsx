"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DangerZone() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isModalOpen) inputRef.current?.focus();
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setConfirmation("");
        setPassword("");
        setError("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isModalOpen]);

  function handleDelete() {
    if (confirmation !== "SUPPRIMER") {
      setError("Tapez exactement « SUPPRIMER » pour confirmer.");
      return;
    }
    if (!password) {
      setError("Entrez votre mot de passe.");
      return;
    }

    startTransition(() => {
      void (async () => {
        setError("");
        const res = await fetch("/api/user/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmation, password }),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => null) as { code?: string } | null;
          if (payload?.code === "WRONG_PASSWORD") {
            setError("Mot de passe incorrect.");
          } else {
            setError("Une erreur est survenue. Réessayez.");
          }
          return;
        }

        router.push("/login?logout=true");
        router.refresh();
      })();
    });
  }

  return (
    <div className="rounded-2xl border border-[--red-dim] bg-[--red-dim] p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[--red]" />
        <div className="space-y-1">
          <h3 className="font-semibold text-[--red]">Zone dangereuse</h3>
          <p className="text-sm leading-6 text-[--red]">
            La suppression de votre compte est définitive. Toutes vos données seront désactivées.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          className="border-[--red-dim] text-[--red] hover:bg-[--red-dim]"
          onClick={() => setIsModalOpen(true)}
        >
          Supprimer mon compte
        </Button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-[--bg-primary]/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[--border] bg-[--bg-card] p-6 shadow-soft">
            <h2 id="delete-title" className="text-lg font-semibold text-[--text-primary]">
              Supprimer mon compte ?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[--text-secondary]">
              Cette action est irréversible. Tapez <strong>SUPPRIMER</strong> pour confirmer, puis entrez votre mot de passe.
            </p>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delete-confirmation">Tapez SUPPRIMER</Label>
                <Input
                  ref={inputRef}
                  id="delete-confirmation"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="SUPPRIMER"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delete-password">Mot de passe actuel</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-[--red]" role="alert">{error}</p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  disabled={isPending || confirmation !== "SUPPRIMER" || !password}
                  onClick={handleDelete}
                  className="flex-1 bg-[--red] text-[--on-green]"
                >
                  {isPending ? "Suppression…" : "Supprimer définitivement"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsModalOpen(false);
                    setConfirmation("");
                    setPassword("");
                    setError("");
                  }}
                  disabled={isPending}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
