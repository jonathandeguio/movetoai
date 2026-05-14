"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamMemberActionsProps {
  membershipId: string;
  currentRoleCode: string;
  memberId: string;
  currentUserId: string;
  availableRoles: { code: string; name: string }[];
  canManage: boolean;
}

const selectClass =
  "h-8 rounded-lg border border-[--border] bg-[--bg-card] px-2 text-xs text-[--text-primary] shadow-sm outline-none transition focus:border-[--blue]";

export function TeamMemberActions({
  membershipId,
  currentRoleCode,
  memberId,
  currentUserId,
  availableRoles,
  canManage,
}: TeamMemberActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [roleCode, setRoleCode] = useState(currentRoleCode);
  const [roleSaved, setRoleSaved] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const isSelf = memberId === currentUserId;

  function handleRoleChange(newCode: string) {
    setRoleCode(newCode);
    setRoleError(null);
    startTransition(() => {
      void (async () => {
        const res = await fetch(`/api/admin/members/${membershipId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roleCode: newCode }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string };
          setRoleError(data.error ?? "Erreur");
          setRoleCode(currentRoleCode); // revert
          return;
        }
        setRoleSaved(true);
        setTimeout(() => { setRoleSaved(false); router.refresh(); }, 1200);
      })();
    });
  }

  function handleRemove() {
    if (!confirmRemove) { setConfirmRemove(true); return; }
    startTransition(() => {
      void (async () => {
        const res = await fetch(`/api/admin/members/${membershipId}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string };
          setRemoveError(data.error ?? "Erreur");
          setConfirmRemove(false);
          return;
        }
        router.refresh();
      })();
    });
  }

  if (!canManage) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Role select */}
      <div className="flex flex-col">
        <select
          value={roleCode}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={isPending}
          className={selectClass}
          aria-label="Changer le rôle"
        >
          {availableRoles.map((r) => (
            <option key={r.code} value={r.code}>{r.name}</option>
          ))}
        </select>
        {roleSaved && (
          <span className="mt-0.5 text-[10px] text-[--green] flex items-center gap-0.5">
            <Check className="h-2.5 w-2.5" />Enregistré
          </span>
        )}
        {roleError && <span className="mt-0.5 text-[10px] text-[--red]">{roleError}</span>}
      </div>

      {/* Remove */}
      {!isSelf && (
        <div className="flex flex-col items-start">
          {confirmRemove ? (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 border-[--red-dim] px-2 text-[10px] text-[--red] hover:bg-[--red-dim]"
                disabled={isPending}
                onClick={handleRemove}
              >
                Confirmer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[10px]"
                onClick={() => setConfirmRemove(false)}
              >
                Annuler
              </Button>
            </div>
          ) : (
            <button
              onClick={handleRemove}
              disabled={isPending}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[--border] text-[--text-muted] hover:border-[--red-dim] hover:bg-[--red-dim] hover:text-[--red] transition-colors"
              aria-label="Retirer ce membre"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          {removeError && <span className="mt-0.5 text-[10px] text-[--red]">{removeError}</span>}
        </div>
      )}
    </div>
  );
}
