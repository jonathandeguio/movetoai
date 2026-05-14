"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function LogoutToast() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("logout") === "true") {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div
        className="flex items-center gap-3 rounded-2xl border border-[--green-border] px-4 py-3"
        style={{ background: "var(--bg-secondary)" }}
      >
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[--green]" />
        <p className="text-sm font-medium text-[--text-primary]">
          Vous avez été déconnecté avec succès.
        </p>
      </div>
    </div>
  );
}
