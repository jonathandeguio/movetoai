// hooks/useAria.ts
// Hook principal Aria — encapsule le store + la logique de communication.

"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAriaStore } from "@/store/aria-store";

export function useAria() {
  const pathname = usePathname();
  const store    = useAriaStore();

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || store.isThinking) return;

      store.addMessage({ role: "user", content: trimmed });
      store.setThinking(true);

      try {
        const res = await fetch("/api/aria/chat", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            message:    trimmed,
            page_path:  pathname,
            session_id: store.sessionId,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json() as { content?: string };
        store.addMessage({
          role:    "aria",
          content: data.content ?? "Je n'ai pas pu traiter votre demande.",
        });
      } catch {
        store.addMessage({
          role:    "aria",
          content: "Une erreur s'est produite. Réessayez dans un instant.",
        });
      } finally {
        store.setThinking(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, store.sessionId, store.isThinking]
  );

  return { ...store, sendMessage, pathname };
}
