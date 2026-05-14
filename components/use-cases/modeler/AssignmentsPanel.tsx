"use client";

import { useEffect, useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AssignmentUser {
  id: string; name: string | null; email: string | null; image: string | null;
}

interface Assignment {
  id: string; diagramId: string; elementId: string;
  assigneeId: string; assignedBy: string;
  role: string | null; dueDate: string | null;
  status: "pending" | "in-progress" | "done";
  notes: string | null; createdAt: string;
  assignee: AssignmentUser;
  assigner: { id: string; name: string | null };
}

interface Props {
  useCaseId: string;
  selectedElementId?: string | null;
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, size = 24 }: { name: string | null; size?: number }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";
  const hue = name ? Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) % 360 : 200;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},50%,35%)`, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.42, fontWeight: 600,
      color: "#fff", userSelect: "none",
    }}>{initial}</div>
  );
}

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  "pending":     "En attente",
  "in-progress": "En cours",
  "done":        "Terminé",
};
const STATUS_COLOR: Record<string, string> = {
  "pending":     "var(--text-disabled)",
  "in-progress": "var(--amber)",
  "done":        "var(--green)",
};
const STATUS_BG: Record<string, string> = {
  "pending":     "var(--bg-hover)",
  "in-progress": "var(--amber-dim)",
  "done":        "var(--green-dim)",
};
const ROLE_OPTIONS = ["analyst", "reviewer", "approver", "observer"];
const ROLE_LABELS: Record<string, string> = {
  analyst:  "Analyste", reviewer: "Réviseur",
  approver: "Approbateur", observer: "Observateur",
};

// ── Main ──────────────────────────────────────────────────────────────────────

export function AssignmentsPanel({ useCaseId, selectedElementId }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading,     setLoading]     = useState(true);

  // Add form state
  const [addAssigneeId, setAddAssigneeId] = useState("");
  const [addRole,       setAddRole]       = useState("analyst");
  const [addDueDate,    setAddDueDate]    = useState("");
  const [adding,        setAdding]        = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r    = await fetch(`/api/use-cases/${useCaseId}/diagram/assignments`);
      const data = await r.json();
      if (Array.isArray(data)) setAssignments(data);
    } finally { setLoading(false); }
  }, [useCaseId]);

  useEffect(() => { load(); }, [load]);

  async function cycleStatus(assignment: Assignment) {
    const order: Assignment["status"][] = ["pending", "in-progress", "done"];
    const next = order[(order.indexOf(assignment.status) + 1) % order.length];
    await fetch(`/api/use-cases/${useCaseId}/diagram/assignments/${assignment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: next }),
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/use-cases/${useCaseId}/diagram/assignments/${id}`, { method: "DELETE" });
    await load();
  }

  async function addAssignment() {
    const eid = selectedElementId;
    if (!eid || !addAssigneeId.trim() || adding) return;
    setAdding(true);
    try {
      await fetch(`/api/use-cases/${useCaseId}/diagram/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          elementId:  eid,
          assigneeId: addAssigneeId.trim(),
          role:       addRole,
          dueDate:    addDueDate || undefined,
        }),
      });
      setAddAssigneeId(""); setAddDueDate("");
      await load();
    } finally { setAdding(false); }
  }

  // Group by elementId, selected element first
  const grouped = assignments.reduce<Record<string, Assignment[]>>((acc, a) => {
    if (!acc[a.elementId]) acc[a.elementId] = [];
    acc[a.elementId].push(a);
    return acc;
  }, {});

  const elementIds = Object.keys(grouped).sort((a, b) => {
    if (a === selectedElementId) return -1;
    if (b === selectedElementId) return 1;
    return 0;
  });

  const S = {
    panel: {
      width: 256, background: "var(--bg-primary)", borderLeft: "1px solid var(--border)",
      display: "flex", flexDirection: "column" as const, height: "100%", overflow: "hidden",
    },
    header: {
      padding: "10px 12px 8px", borderBottom: "1px solid var(--border)", flexShrink: 0,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const,
      color: "var(--green)",
    },
    scroll: { flex: 1, overflowY: "auto" as const, padding: "8px 10px" },
    group: { marginBottom: 12 },
    groupLabel: (highlight: boolean) => ({
      fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em",
      color: highlight ? "var(--blue)" : "var(--text-muted)",
      background: highlight ? "var(--blue-dim)" : "var(--bg-hover)",
      borderRadius: 4, padding: "2px 6px", marginBottom: 6, display: "inline-block",
    }),
    row: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4, position: "relative" as const },
    assigneeName: { fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 },
    statusBadge: (s: string) => ({
      fontSize: 9, padding: "1px 6px", borderRadius: 4,
      background: STATUS_BG[s] ?? "var(--bg-hover)",
      color: STATUS_COLOR[s] ?? "var(--text-muted)",
      cursor: "pointer", userSelect: "none" as const,
    }),
    roleBadge: {
      fontSize: 9, color: "var(--text-muted)", background: "var(--bg-hover)",
      borderRadius: 4, padding: "1px 5px",
    },
    delBtn: {
      fontSize: 10, color: "var(--red)", background: "none", border: "none",
      cursor: "pointer", marginLeft: "auto", padding: 0, opacity: 0.7,
    },
    footer: {
      flexShrink: 0, padding: "8px 10px", borderTop: "1px solid var(--border)",
      background: "var(--bg-primary)",
    },
    footerTitle: { fontSize: 10, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 },
    input: {
      width: "100%", padding: "5px 8px", borderRadius: 6,
      border: "1px solid var(--border)", background: "var(--bg-secondary)",
      color: "var(--text-primary)", fontSize: 11, boxSizing: "border-box" as const,
      fontFamily: "inherit", marginBottom: 4,
    },
    select: {
      width: "100%", padding: "4px 8px", borderRadius: 6,
      border: "1px solid var(--border)", background: "var(--bg-secondary)",
      color: "var(--text-primary)", fontSize: 11, boxSizing: "border-box" as const,
      fontFamily: "inherit", marginBottom: 4,
    },
    addBtn: (disabled: boolean) => ({
      width: "100%", padding: "5px 0", borderRadius: 6,
      border: "1px solid var(--green-border)", background: disabled ? "transparent" : "var(--green-dim)",
      color: disabled ? "var(--text-disabled)" : "var(--green)",
      fontSize: 11, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
    }),
  };

  return (
    <div style={S.panel}>
      <div style={S.header}>
        Assignations · {assignments.length}
      </div>

      <div style={S.scroll}>
        {loading && (
          <p style={{ fontSize: 11, color: "var(--text-disabled)", textAlign: "center", paddingTop: 16 }}>
            Chargement…
          </p>
        )}
        {!loading && assignments.length === 0 && (
          <p style={{ fontSize: 11, color: "var(--text-disabled)", textAlign: "center", paddingTop: 16 }}>
            Aucune assignation.
          </p>
        )}

        {elementIds.map(eid => (
          <div key={eid} style={S.group}>
            <div style={S.groupLabel(eid === selectedElementId)}>
              {eid.slice(0, 18)}
            </div>
            {grouped[eid].map(a => (
              <div key={a.id} style={S.row}>
                <Avatar name={a.assignee.name} size={20} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.assigneeName}>
                    {a.assignee.name ?? a.assignee.email ?? a.assigneeId.slice(0, 10)}
                  </div>
                  {a.role && <span style={S.roleBadge}>{ROLE_LABELS[a.role] ?? a.role}</span>}
                </div>
                <button style={S.statusBadge(a.status)} onClick={() => cycleStatus(a)}
                  title="Cliquer pour changer le statut">
                  {STATUS_LABEL[a.status]}
                </button>
                <button style={S.delBtn} onClick={() => remove(a.id)} title="Retirer">×</button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Add assignment form — only when an element is selected */}
      {selectedElementId ? (
        <div style={S.footer}>
          <p style={S.footerTitle}>Assigner à l&apos;élément sélectionné</p>
          <input
            value={addAssigneeId}
            onChange={e => setAddAssigneeId(e.target.value)}
            placeholder="User ID ou email…"
            style={S.input}
          />
          <select value={addRole} onChange={e => setAddRole(e.target.value)} style={S.select}>
            {ROLE_OPTIONS.map(r => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <input type="date" value={addDueDate} onChange={e => setAddDueDate(e.target.value)}
            style={{ ...S.input, colorScheme: "dark" }} />
          <button style={S.addBtn(!addAssigneeId.trim() || adding)} onClick={addAssignment}>
            {adding ? "Assignation…" : "Assigner"}
          </button>
        </div>
      ) : (
        <div style={{ ...S.footer, textAlign: "center" }}>
          <p style={{ fontSize: 10, color: "var(--text-disabled)" }}>
            Sélectionnez un élément pour assigner.
          </p>
        </div>
      )}
    </div>
  );
}
