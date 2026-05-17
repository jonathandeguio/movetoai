"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface GenerateBpmnButtonProps {
  processId: string;
}

export function GenerateBpmnButton({ processId }: GenerateBpmnButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setStatus("idle");
    setMessage(null);
    try {
      const res = await fetch(`/api/processes/${processId}/bpmn/generate`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la génération.");
      }
      setStatus("success");
      setMessage("Diagramme BPMN généré avec succès.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => { void handleGenerate(); }}
        disabled={loading}
        className="gap-1.5"
      >
        {loading ? "Génération..." : "Générer BPMN avec l'IA"}
        {!loading && <span aria-hidden className="text-[--green]">✦</span>}
      </Button>
      {message && (
        <p
          className="text-xs"
          style={{ color: status === "success" ? "var(--green)" : "var(--red)" }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
