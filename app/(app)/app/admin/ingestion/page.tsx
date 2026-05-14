export const dynamic = "force-dynamic";

import { requirePermission } from "@/server/permissions";
import { ingestionRepo } from "@/lib/repositories/ingestion.repo";
import { IngestionUploader } from "@/components/admin/IngestionUploader";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: "color-mix(in srgb, var(--amber, #f59e0b) 15%, transparent)", text: "var(--amber, #f59e0b)" },
    processing: { bg: "color-mix(in srgb, var(--blue, #3b82f6) 15%, transparent)", text: "var(--blue, #3b82f6)" },
    done: { bg: "color-mix(in srgb, var(--green) 15%, transparent)", text: "var(--green)" },
    failed: { bg: "color-mix(in srgb, var(--red, #ef4444) 15%, transparent)", text: "var(--red, #ef4444)" },
  };
  const c = colors[status] ?? colors.pending;

  return (
    <span
      style={{
        padding: "0.15rem 0.55rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: c.bg,
        color: c.text,
      }}
    >
      {status}
    </span>
  );
}

interface IngestionJobRow {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number | null;
  status: string;
  targetEntityType: string | null;
  errorMessage: string | null;
  createdAt: Date;
}

export default async function IngestionPage() {
  const { workspace } = await requirePermission("business-structure.manage");

  const jobs = (await ingestionRepo.findRecentJobs(workspace!.id)) as IngestionJobRow[];

  const total = jobs.length;
  const done = jobs.filter((j) => j.status === "done").length;
  const failed = jobs.filter((j) => j.status === "failed").length;
  const processing = jobs.filter(
    (j) => j.status === "processing" || j.status === "pending"
  ).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <section
        style={{
          borderRadius: "1.5rem",
          border: "1px solid var(--green-border)",
          background: "var(--bg-card)",
          padding: "2rem",
          boxShadow: "var(--shadow-soft-sm)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.2rem 0.75rem",
              borderRadius: "999px",
              border: "1px solid var(--green-border)",
              color: "var(--green)",
              fontSize: "0.8rem",
              fontWeight: 600,
              width: "fit-content",
            }}
          >
            Admin
          </span>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Pipeline d&apos;ingestion
          </h1>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: "40rem", margin: 0, lineHeight: 1.6 }}>
            Importez des documents (TXT, CSV, PDF, DOCX, XLSX) pour en extraire automatiquement
            des entités structurées grâce à l&apos;IA.
          </p>
        </div>
      </section>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
        }}
      >
        {[
          { label: "Total jobs", value: total, color: "var(--text-primary)" },
          { label: "Terminés", value: done, color: "var(--green)" },
          { label: "Échoués", value: failed, color: "var(--red, #ef4444)" },
          { label: "En cours", value: processing, color: "var(--amber, #f59e0b)" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              borderRadius: "1rem",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              padding: "1.25rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <span
              style={{ fontSize: "1.75rem", fontWeight: 700, color: stat.color, lineHeight: 1 }}
            >
              {stat.value}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Uploader */}
        <IngestionUploader />

        {/* Jobs list */}
        <div
          style={{
            borderRadius: "1rem",
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>
              Jobs récents
            </h2>
          </div>

          {jobs.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Aucun job d&apos;ingestion pour l&apos;instant.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {jobs.map((job, i) => (
                <div
                  key={job.id}
                  style={{
                    padding: "0.85rem 1.25rem",
                    borderBottom: i < jobs.length - 1 ? "1px solid var(--border)" : undefined,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {job.fileName}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {job.fileType.toUpperCase()}
                      {job.fileSize ? ` · ${Math.round(job.fileSize / 1024)} Ko` : ""}
                      {" · "}
                      {new Date(job.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {job.errorMessage && job.status !== "done" && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--red, #ef4444)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "22rem",
                        }}
                      >
                        {job.errorMessage}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
