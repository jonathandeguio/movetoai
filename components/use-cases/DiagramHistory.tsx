"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/bpmn/bpmn-utils";

interface DiagramVersion {
  versionNumber: number;
  changeSummary: string | null;
  createdAt: string;
  author: { name: string | null } | null;
}

interface Props {
  useCaseId: string;
  currentVersion: number;
  onVersionRestored?: () => void;
}

export function DiagramHistory({ useCaseId, currentVersion, onVersionRestored }: Props) {
  const [versions, setVersions] = useState<DiagramVersion[]>([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    fetch(`/api/use-cases/${useCaseId}/diagram/versions`)
      .then((r) => r.json())
      .then(setVersions)
      .catch(() => {});
  }, [useCaseId, currentVersion]);

  async function restoreVersion(versionNumber: number) {
    const confirmed = window.confirm(
      `Restaurer la version ${versionNumber} ?\nCette action créera une nouvelle version avec le contenu de la v${versionNumber}.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res  = await fetch(`/api/use-cases/${useCaseId}/diagram/versions/${versionNumber}`);
      const data = await res.json();
      if (!data.xml) return;

      await fetch(`/api/use-cases/${useCaseId}/diagram`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xml: data.xml, changeSummary: `Restauration v${versionNumber}` }),
      });
      onVersionRestored?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: 256,
        background: "var(--bg-primary)",
        borderLeft: "1px solid var(--border)",
        padding: "14px 12px",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--green)",
          marginBottom: 12,
        }}
      >
        Historique · {versions.length} versions
      </p>

      {versions.length === 0 && (
        <p style={{ fontSize: 11, color: "var(--text-disabled)" }}>
          Aucune version sauvegardée.
        </p>
      )}

      {versions.map((v) => (
        <div
          key={v.versionNumber}
          style={{
            paddingBottom: 12,
            marginBottom: 12,
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: v.versionNumber === currentVersion ? "var(--green)" : "var(--text-secondary)",
              }}
            >
              v{v.versionNumber}
              {v.versionNumber === currentVersion && (
                <span style={{ fontSize: 10, marginLeft: 6, color: "var(--green)" }}>
                  (actuelle)
                </span>
              )}
            </span>
            <span style={{ fontSize: 10, color: "var(--text-disabled)" }}>
              {formatRelativeTime(new Date(v.createdAt))}
            </span>
          </div>

          {v.changeSummary && (
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                lineHeight: 1.4,
                marginBottom: 2,
              }}
            >
              {v.changeSummary}
            </p>
          )}

          {v.author?.name && (
            <p style={{ fontSize: 10, color: "var(--text-disabled)", marginBottom: 4 }}>
              par {v.author.name}
            </p>
          )}

          {v.versionNumber !== currentVersion && (
            <button
              onClick={() => restoreVersion(v.versionNumber)}
              disabled={loading}
              style={{
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 4,
                border: "1px solid var(--green-border)",
                background: "var(--green-dim)",
                color: "var(--green)",
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              Restaurer
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
