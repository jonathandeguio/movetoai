"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type LogoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  copy?: {
    title?: string;
    message?: string;
    confirm?: string;
    cancel?: string;
  };
};

export function LogoutModal({ isOpen, onClose, copy }: LogoutModalProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const title = copy?.title ?? "Se déconnecter ?";
  const message = copy?.message ?? "Vous allez être redirigé vers la page de connexion.";
  const confirmLabel = copy?.confirm ?? "Confirmer";
  const cancelLabel = copy?.cancel ?? "Annuler";

  // Focus trap: focus cancel button when modal opens
  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Focus trap within modal
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [isOpen]);

  function handleLogout() {
    startTransition(() => {
      void (async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          // Ignore errors — we redirect anyway
        }
        // Notify other tabs
        try {
          const bc = new BroadcastChannel("mta-auth");
          bc.postMessage({ type: "LOGOUT" });
          bc.close();
        } catch {
          // BroadcastChannel not supported — fallback via storage
          localStorage.setItem("mta-logout", Date.now().toString());
          localStorage.removeItem("mta-logout");
        }
        router.push("/login?logout=true");
        router.refresh();
      })();
    });
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
      aria-describedby="logout-desc"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-[--border] p-6"
        style={{ background: "var(--bg-secondary)" }}
      >
        <h2
          id="logout-title"
          className="text-lg font-semibold text-[--text-primary]"
        >
          {title}
        </h2>
        <p id="logout-desc" className="mt-2 text-sm leading-6 text-[--text-secondary]">
          {message}
        </p>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            className="flex-1"
            onClick={handleLogout}
            disabled={isPending}
          >
            {confirmLabel}
          </Button>
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
