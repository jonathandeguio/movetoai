"use client";

import { useState, useRef } from "react";

type UploadState = "idle" | "uploading" | "processing" | "done" | "error";

type EntityType = "application" | "process" | "capability";

interface ExtractedApplication {
  name: string;
  vendor: string;
  description: string;
  criticality: string;
}

interface ExtractedProcess {
  name: string;
  description: string;
  aiPotential: string;
}

interface ExtractedCapability {
  name: string;
  description: string;
  level: string;
}

interface ExtractedEntities {
  applications: ExtractedApplication[];
  processes: ExtractedProcess[];
  capabilities: ExtractedCapability[];
}

interface JobStatus {
  id: string;
  fileName: string;
  status: string;
  extractedEntities: ExtractedEntities | null;
  errorMessage: string | null;
}

const CRITICALITY_COLORS: Record<string, string> = {
  critical: "var(--red, #ef4444)",
  high: "var(--orange, #f97316)",
  medium: "var(--amber, #f59e0b)",
  low: "var(--green)",
};

const AI_POTENTIAL_COLORS: Record<string, string> = {
  high: "var(--green)",
  medium: "var(--amber, #f59e0b)",
  low: "var(--text-muted)",
};

const LEVEL_COLORS: Record<string, string> = {
  expert: "var(--purple, #8b5cf6)",
  advanced: "var(--blue, #3b82f6)",
  intermediate: "var(--amber, #f59e0b)",
  basic: "var(--text-muted)",
};

export function IngestionUploader({ onJobCreated }: { onJobCreated?: () => void }) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [targetEntityType, setTargetEntityType] = useState<string>("auto");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function startPolling(jobId: string) {
    setUploadState("processing");
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/ingestion/${jobId}`);
        if (!res.ok) return;
        const data = await res.json() as { job: JobStatus };
        const job = data.job;

        if (job.status === "done") {
          stopPolling();
          setJobStatus(job);
          setUploadState("done");
          onJobCreated?.();
        } else if (job.status === "failed") {
          stopPolling();
          setError(job.errorMessage ?? "Extraction failed");
          setUploadState("error");
        }
      } catch {
        // Silently retry on network errors
      }
    }, 2000);
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.[0]) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    const file = fileInput.files[0];
    setFileName(file.name);
    setError(null);
    setJobStatus(null);
    setUploadState("uploading");
    setProgress(0);

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return p + Math.random() * 12;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetEntityType", targetEntityType);

      const res = await fetch("/api/ingestion", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Upload failed");
      }

      const data = await res.json() as { job: { id: string; status: string }; message?: string };
      setCurrentJobId(data.job.id);

      if (data.job.status === "failed") {
        setError(data.message ?? "File could not be processed");
        setUploadState("error");
        return;
      }

      startPolling(data.job.id);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Upload error");
      setUploadState("error");
    }
  }

  function handleReset() {
    stopPolling();
    setUploadState("idle");
    setProgress(0);
    setCurrentJobId(null);
    setJobStatus(null);
    setError(null);
    setFileName(null);
    setTargetEntityType("auto");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const isProcessing = uploadState === "uploading" || uploadState === "processing";
  const entities = jobStatus?.extractedEntities;

  return (
    <div
      style={{
        border: "1px solid var(--green-border)",
        borderRadius: "1rem",
        background: "var(--bg-card)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      <div>
        <h3
          style={{
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: "0.25rem",
          }}
        >
          Importer un document
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Déposez un fichier texte, CSV, PDF, DOCX ou XLSX. L&apos;IA en extraira automatiquement
          les entités métier.
        </p>
      </div>

      <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* File input */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label
            style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" }}
          >
            Fichier
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv,.pdf,.docx,.xlsx"
            disabled={isProcessing}
            style={{
              padding: "0.5rem",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              background: "var(--bg-input, var(--bg-card))",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              cursor: isProcessing ? "not-allowed" : "pointer",
              opacity: isProcessing ? 0.6 : 1,
            }}
          />
        </div>

        {/* Target entity type */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label
            style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" }}
          >
            Type d&apos;entité cible
          </label>
          <select
            value={targetEntityType}
            onChange={(e) => setTargetEntityType(e.target.value)}
            disabled={isProcessing}
            style={{
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              background: "var(--bg-input, var(--bg-card))",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              cursor: isProcessing ? "not-allowed" : "pointer",
              opacity: isProcessing ? 0.6 : 1,
            }}
          >
            <option value="auto">Automatique (tous types)</option>
            <option value="application">Application</option>
            <option value="process">Processus</option>
            <option value="capability">Capacité</option>
          </select>
        </div>

        {/* Progress bar */}
        {(uploadState === "uploading" || uploadState === "processing") && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                {uploadState === "uploading"
                  ? `Envoi de "${fileName}"…`
                  : "Extraction des entités en cours…"}
              </span>
              {uploadState === "uploading" && (
                <span>{Math.round(progress)}%</span>
              )}
            </div>
            <div
              style={{
                height: "6px",
                borderRadius: "999px",
                background: "var(--border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: "999px",
                  background: "var(--green)",
                  width: uploadState === "processing" ? "100%" : `${progress}%`,
                  transition: "width 0.3s ease",
                  animation: uploadState === "processing" ? "pulse 1.5s infinite" : undefined,
                }}
              />
            </div>
            {uploadState === "processing" && (
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                L&apos;analyse peut prendre quelques secondes…
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "0.75rem",
              borderRadius: "0.5rem",
              background: "color-mix(in srgb, var(--red, #ef4444) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--red, #ef4444) 30%, transparent)",
              color: "var(--red, #ef4444)",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {uploadState !== "done" && (
            <button
              type="submit"
              disabled={isProcessing}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                background: isProcessing ? "var(--border)" : "var(--green)",
                color: isProcessing ? "var(--text-muted)" : "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: isProcessing ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
              }}
            >
              {isProcessing ? "En cours…" : "Analyser le fichier"}
            </button>
          )}
          {(uploadState === "done" || uploadState === "error") && (
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                background: "transparent",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                fontWeight: 500,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Nouveau fichier
            </button>
          )}
        </div>
      </form>

      {/* Results */}
      {uploadState === "done" && entities && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              background: "color-mix(in srgb, var(--green) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--green) 30%, transparent)",
              color: "var(--green)",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            Extraction terminée pour &quot;{jobStatus?.fileName}&quot;
          </div>

          {/* Applications */}
          {entities.applications.length > 0 && (
            <EntitySection
              title="Applications"
              count={entities.applications.length}
              color="var(--blue, #3b82f6)"
            >
              {entities.applications.map((app, i) => (
                <EntityCard key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                      {app.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        background: "color-mix(in srgb," + (CRITICALITY_COLORS[app.criticality] ?? "var(--text-muted)") + " 15%, transparent)",
                        color: CRITICALITY_COLORS[app.criticality] ?? "var(--text-muted)",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {app.criticality}
                    </span>
                  </div>
                  {app.vendor && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{app.vendor}</span>
                  )}
                  {app.description && (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                      {app.description}
                    </p>
                  )}
                </EntityCard>
              ))}
            </EntitySection>
          )}

          {/* Processes */}
          {entities.processes.length > 0 && (
            <EntitySection
              title="Processus"
              count={entities.processes.length}
              color="var(--purple, #8b5cf6)"
            >
              {entities.processes.map((proc, i) => (
                <EntityCard key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                      {proc.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        background: "color-mix(in srgb," + (AI_POTENTIAL_COLORS[proc.aiPotential] ?? "var(--text-muted)") + " 15%, transparent)",
                        color: AI_POTENTIAL_COLORS[proc.aiPotential] ?? "var(--text-muted)",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      IA: {proc.aiPotential}
                    </span>
                  </div>
                  {proc.description && (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                      {proc.description}
                    </p>
                  )}
                </EntityCard>
              ))}
            </EntitySection>
          )}

          {/* Capabilities */}
          {entities.capabilities.length > 0 && (
            <EntitySection
              title="Capacités"
              count={entities.capabilities.length}
              color="var(--amber, #f59e0b)"
            >
              {entities.capabilities.map((cap, i) => (
                <EntityCard key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                      {cap.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        background: "color-mix(in srgb," + (LEVEL_COLORS[cap.level] ?? "var(--text-muted)") + " 15%, transparent)",
                        color: LEVEL_COLORS[cap.level] ?? "var(--text-muted)",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {cap.level}
                    </span>
                  </div>
                  {cap.description && (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                      {cap.description}
                    </p>
                  )}
                </EntityCard>
              ))}
            </EntitySection>
          )}

          {entities.applications.length === 0 &&
            entities.processes.length === 0 &&
            entities.capabilities.length === 0 && (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center" }}>
                Aucune entité extraite. Essayez avec un document plus structuré.
              </p>
            )}
        </div>
      )}

      {/* Polling indicator when processing */}
      {uploadState === "processing" && currentJobId && (
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
          Job ID: {currentJobId} — vérification toutes les 2s…
        </p>
      )}
    </div>
  );
}

function EntitySection({
  title,
  count,
  color,
  children,
}: {
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
          {title}
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            padding: "0.1rem 0.45rem",
            borderRadius: "999px",
            background: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          {count}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", paddingLeft: "1rem" }}>
        {children}
      </div>
    </div>
  );
}

function EntityCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "0.6rem 0.75rem",
        borderRadius: "0.5rem",
        border: "1px solid var(--border)",
        background: "var(--bg-subtle, var(--bg-card))",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}
    >
      {children}
    </div>
  );
}
