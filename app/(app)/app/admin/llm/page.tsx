"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  FlaskConical,
  Loader2,
  RefreshCw,
  Settings2,
  TrendingDown,
  XCircle,
  Zap,
} from "lucide-react";

// ── Types matching the actual /api/admin/llm/status response ─────────────────

interface ProviderInfo {
  available:     boolean;
  enabled:       boolean;
  model_simple?: string;
  model_complex?:string;
  has_key?:      boolean;
  model?:        string;
  cost_euros_month?: string;
  calls_month?:  number;
}

interface ByProvider {
  provider:    string;
  calls:       number;
  avg_latency: number;
  total_cost:  string;
}

interface SuccessRate {
  provider:    string;
  total:       number;
  successes:   number;
  successRate: number;
}

interface StatusMetrics {
  total_calls_7d:    number;
  claude_rate_pct:   number;
  high_claude_alert: boolean;
  by_provider:       ByProvider[];
  success_rates:     SuccessRate[];
}

interface RecentLog {
  id:          string;
  task:        string;
  provider:    string;
  model:       string;
  latencyMs:   number;
  tokensUsed:  number | null;
  costCents:   number;
  fallbackUsed:boolean;
  success:     boolean;
  error:       string | null;
  createdAt:   string;
}

interface StatusData {
  providers: {
    ollama: ProviderInfo;
    groq:   ProviderInfo;
    claude: ProviderInfo;
  };
  metrics:     StatusMetrics;
  recent_logs: RecentLog[];
  config: LLMConfig;
}

interface LLMConfig {
  strategy:       string;
  ollama_enabled: boolean;
  groq_enabled:   boolean;
  claude_enabled: boolean;
  log_enabled:    boolean;
  force_tasks:    string[];
}

interface TestResult {
  success:      boolean;
  provider?:    string;
  model?:       string;
  content?:     string;
  latency_ms?:  number;
  tokens_used?: number;
  error?:       string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtLatency(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s    = Math.floor(diff / 1000);
  if (s < 60)   return `il y a ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60)   return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

const PROVIDER_COLORS: Record<string, string> = {
  ollama: "#10b981",
  groq:   "#f59e0b",
  claude: "#3b82f6",
};

const PROVIDER_LABELS: Record<string, string> = {
  ollama: "Ollama",
  groq:   "Groq",
  claude: "Claude",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LLMAdminPage() {
  const [status,      setStatus]      = useState<StatusData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [configDraft, setConfigDraft] = useState<LLMConfig | null>(null);
  const [configSaving,setConfigSaving]= useState(false);
  const [testProvider,setTestProvider]= useState<"ollama" | "groq" | "claude">("ollama");
  const [testPrompt,  setTestPrompt]  = useState("Réponds juste: OK");
  const [testResult,  setTestResult]  = useState<TestResult | null>(null);
  const [testing,     setTesting]     = useState(false);
  const [logsExpanded,setLogsExpanded]= useState(false);

  const fetchAll = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const [statusRes, cfgRes] = await Promise.all([
        fetch("/api/admin/llm/status"),
        fetch("/api/admin/llm/config"),
      ]);
      if (statusRes.ok) {
        const d = await statusRes.json() as StatusData;
        setStatus(d);
      }
      if (cfgRes.ok) {
        const c = await cfgRes.json() as LLMConfig;
        setConfigDraft(c);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function saveConfig() {
    if (!configDraft) return;
    setConfigSaving(true);
    try {
      await fetch("/api/admin/llm/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configDraft),
      });
      await fetchAll(true);
    } finally {
      setConfigSaving(false);
    }
  }

  async function runTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res  = await fetch("/api/admin/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: testProvider, prompt: testPrompt }),
      });
      const data = await res.json() as TestResult;
      setTestResult(data);
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
      </div>
    );
  }

  const metrics    = status?.metrics;
  const byProvider = metrics?.by_provider ?? [];
  const sRates     = metrics?.success_rates ?? [];
  const logs       = status?.recent_logs ?? [];
  const visLogs    = logsExpanded ? logs : logs.slice(0, 10);
  const totalCalls = metrics?.total_calls_7d ?? 0;
  const claudeInfo = status?.providers.claude;

  // aggregate total success from success_rates
  const totalSuccess = sRates.reduce((s, r) => s + r.successes, 0);
  const overallRate  = totalCalls > 0 ? Math.round((totalSuccess / totalCalls) * 100) : null;

  const providers: { key: "ollama" | "groq" | "claude"; label: string; desc: string }[] = [
    { key: "ollama", label: "Ollama", desc: "Local — gratuit, privé" },
    { key: "groq",   label: "Groq",   desc: "Cloud — gratuit, rapide" },
    { key: "claude", label: "Claude", desc: "Anthropic — payant, précis" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Infrastructure IA / LLM
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: "4px 0 0" }}>
            Monitoring des providers, configuration live et logs d&apos;appels
          </p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--bg-card)", cursor: "pointer",
            fontSize: 13, color: "var(--text-secondary)",
          }}
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* ── KPI row ────────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          {
            label: "Appels 7 jours",
            value: totalCalls.toString(),
            icon:  <Activity size={15} />,
            color: "var(--blue)",
          },
          {
            label: "Taux de succès",
            value: overallRate !== null ? `${overallRate} %` : "—",
            icon:  <CheckCircle2 size={15} />,
            color: overallRate !== null && overallRate < 80 ? "var(--orange)" : "var(--green)",
          },
          {
            label: "Escalade Claude",
            value: `${metrics?.claude_rate_pct ?? 0} %`,
            icon:  <TrendingDown size={15} />,
            color: metrics?.high_claude_alert ? "var(--orange)" : "var(--text-secondary)",
            alert: metrics?.high_claude_alert,
          },
          {
            label: "Coût Claude ce mois",
            value: claudeInfo?.cost_euros_month ? `€${claudeInfo.cost_euros_month}` : "€0",
            icon:  <Zap size={15} />,
            color: "var(--text-secondary)",
          },
        ].map(({ label, value, icon, color, alert }) => (
          <div key={label} style={{
            background: "var(--bg-card)",
            border: `1px solid ${alert ? "var(--orange)" : "var(--border)"}`,
            borderRadius: 12, padding: "16px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ color }}>{icon}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-tertiary)" }}>
                {label}
              </span>
              {alert && <AlertTriangle size={12} style={{ color: "var(--orange)", marginLeft: "auto" }} />}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Status des providers ─────────────────────────────────────────────── */}
      <section style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 20,
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>
          <Cpu size={15} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
          Status des providers
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {providers.map(({ key, label, desc }) => {
            const info = status?.providers[key];
            const stat = byProvider.find((p) => p.provider === key);
            const sr   = sRates.find((r) => r.provider === key);
            return (
              <div key={key} style={{
                background: "var(--bg-primary)", border: "1px solid var(--border)",
                borderRadius: 10, padding: 16,
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>
                      {desc}
                    </div>
                  </div>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 3,
                    background: info?.available ? "#10b981" : "#ef4444",
                    boxShadow: info?.available ? "0 0 6px #10b981" : "none",
                  }} />
                </div>

                {/* Status badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  {info?.available ? (
                    <CheckCircle2 size={14} style={{ color: "#10b981" }} />
                  ) : (
                    <XCircle size={14} style={{ color: "#ef4444" }} />
                  )}
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: info?.available ? "#10b981" : "#ef4444",
                  }}>
                    {info?.available ? "Disponible" : "Indisponible"}
                  </span>
                  {key === "groq" && !info?.has_key && (
                    <span style={{ fontSize: 11, color: "var(--orange)" }}>— clé manquante</span>
                  )}
                </div>

                {/* Model info */}
                {key !== "claude" && info?.model_simple && (
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 6 }}>
                    Simple: <code style={{ fontFamily: "monospace" }}>{info.model_simple}</code>
                  </div>
                )}
                {key === "claude" && info?.model && (
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 6 }}>
                    Modèle: <code style={{ fontFamily: "monospace" }}>{info.model}</code>
                  </div>
                )}

                {/* Stats */}
                {stat && stat.calls > 0 && (
                  <div style={{
                    marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)",
                    display: "flex", gap: 8, fontSize: 11, color: "var(--text-tertiary)",
                  }}>
                    <span>{stat.calls} appels</span>
                    <span>·</span>
                    <span>{sr ? `${sr.successRate}% succès` : "—"}</span>
                    <span>·</span>
                    <span>ø {fmtLatency(stat.avg_latency)}</span>
                  </div>
                )}
                {(!stat || stat.calls === 0) && (
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 8 }}>
                    Aucun appel cette semaine
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Métriques + répartition ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>

        {/* Répartition par provider */}
        <section style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>
            Répartition 7 jours par provider
          </h2>
          {byProvider.length > 0 && totalCalls > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {byProvider.map((p) => {
                const pct = totalCalls > 0 ? (p.calls / totalCalls) * 100 : 0;
                const sr  = sRates.find((r) => r.provider === p.provider);
                return (
                  <div key={p.provider}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: PROVIDER_COLORS[p.provider] ?? "#888" }} />
                        <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                          {PROVIDER_LABELS[p.provider] ?? p.provider}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-tertiary)" }}>
                        <span>{p.calls} appels</span>
                        <span>{sr ? `${sr.successRate}%` : "—"} succès</span>
                        <span>ø {fmtLatency(p.avg_latency)}</span>
                        {Number(p.total_cost) > 0 && (
                          <span style={{ color: "var(--text-secondary)" }}>€{p.total_cost}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ height: 8, background: "var(--bg-hover)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        width: `${pct}%`, height: "100%",
                        background: PROVIDER_COLORS[p.provider] ?? "#888",
                        borderRadius: 4, transition: "width 0.3s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Activity size={28} style={{ color: "var(--text-tertiary)", marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0 }}>
                Aucune donnée sur les 7 derniers jours
              </p>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "4px 0 0" }}>
                Activez le logging pour voir les métriques ici
              </p>
            </div>
          )}
        </section>

        {/* Claude ce mois */}
        <section style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20,
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            <Zap size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "middle", color: "var(--blue)" }} />
            Claude ce mois
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Appels", value: (claudeInfo?.calls_month ?? 0).toString() },
              { label: "Coût estimé", value: claudeInfo?.cost_euros_month ? `€${claudeInfo.cost_euros_month}` : "€0" },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: "var(--bg-primary)", borderRadius: 8, padding: "12px 14px",
              }}>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
              </div>
            ))}
          </div>
          {metrics?.high_claude_alert && (
            <div style={{
              padding: "10px 12px", borderRadius: 8,
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.3)",
              display: "flex", gap: 8, alignItems: "flex-start",
            }}>
              <AlertTriangle size={14} style={{ color: "var(--orange)", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                Taux d&apos;escalade Claude &gt; 30 %. Vérifiez la disponibilité d&apos;Ollama / Groq.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ── Configuration live ─────────────────────────────────────────────── */}
      <section style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            <Settings2 size={15} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            Configuration live
          </h2>
          <button
            onClick={saveConfig}
            disabled={configSaving || !configDraft}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 8,
              background: "var(--blue)", color: "#fff",
              border: "none", cursor: configSaving ? "wait" : "pointer",
              fontSize: 13, fontWeight: 500,
              opacity: configSaving ? 0.7 : 1,
            }}
          >
            {configSaving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            Appliquer sans redémarrer
          </button>
        </div>

        {configDraft && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Strategy */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                Stratégie de routing
              </label>
              <select
                value={configDraft.strategy}
                onChange={(e) => setConfigDraft((d) => d ? { ...d, strategy: e.target.value } : d)}
                style={{
                  width: "100%", padding: "9px 10px", borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)", fontSize: 13,
                }}
              >
                <option value="auto">Auto — cascade intelligente</option>
                <option value="ollama_only">Ollama uniquement (local)</option>
                <option value="groq_only">Groq uniquement</option>
                <option value="claude_only">Claude uniquement</option>
              </select>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text-tertiary)" }}>
                Auto: simple → Ollama → Groq → Claude · complex → Groq → Claude · critical → Claude
              </p>
            </div>

            {/* Providers toggles */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>
                Providers activés
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(["ollama", "groq", "claude"] as const).map((key) => {
                  const fieldKey = `${key}_enabled` as keyof LLMConfig;
                  const enabled  = configDraft[fieldKey] as boolean;
                  const available= status?.providers[key]?.available ?? false;
                  return (
                    <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setConfigDraft((d) => d ? { ...d, [fieldKey]: e.target.checked } : d)}
                        style={{ width: 16, height: 16, accentColor: PROVIDER_COLORS[key] }}
                      />
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: PROVIDER_COLORS[key] }} />
                      <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, flex: 1 }}>
                        {PROVIDER_LABELS[key]}
                      </span>
                      <span style={{ fontSize: 11, color: available ? "#10b981" : "#ef4444" }}>
                        {available ? "✓" : "✗"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Log toggle */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={configDraft.log_enabled}
                  onChange={(e) => setConfigDraft((d) => d ? { ...d, log_enabled: e.target.checked } : d)}
                  style={{ width: 16, height: 16, accentColor: "var(--blue)" }}
                />
                <div>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                    Logging des appels LLM
                  </span>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-tertiary)" }}>
                    Enregistre chaque appel en base pour ce monitoring
                  </p>
                </div>
              </label>
            </div>

            {/* Force Claude tasks */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                Tâches forcées sur Claude
              </label>
              <input
                type="text"
                value={(configDraft.force_tasks ?? []).join(", ")}
                onChange={(e) => {
                  const tasks = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                  setConfigDraft((d) => d ? { ...d, force_tasks: tasks } : d);
                }}
                placeholder="bpmn_generate, governance_check, ..."
                style={{
                  width: "100%", padding: "9px 10px", borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)", fontSize: 13, boxSizing: "border-box",
                }}
              />
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text-tertiary)" }}>
                Ces tâches ignorent la cascade et appellent Claude directement (séparées par virgule)
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── Test provider ──────────────────────────────────────────────────── */}
      <section style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 20,
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>
          <FlaskConical size={15} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
          Tester un provider
        </h2>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-tertiary)", marginBottom: 4 }}>
              Provider
            </label>
            <select
              value={testProvider}
              onChange={(e) => setTestProvider(e.target.value as "ollama" | "groq" | "claude")}
              style={{
                padding: "9px 10px", borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)", fontSize: 13,
              }}
            >
              <option value="ollama">Ollama</option>
              <option value="groq">Groq</option>
              <option value="claude">Claude</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-tertiary)", marginBottom: 4 }}>
              Prompt de test
            </label>
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              style={{
                width: "100%", padding: "9px 10px", borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)", fontSize: 13, boxSizing: "border-box",
              }}
            />
          </div>
          <button
            onClick={runTest}
            disabled={testing}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 8,
              background: "var(--blue)", color: "#fff",
              border: "none", cursor: testing ? "wait" : "pointer",
              fontSize: 13, fontWeight: 500, flexShrink: 0,
            }}
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            Lancer le test
          </button>
        </div>

        {testResult && (
          <div style={{
            marginTop: 14, padding: 14, borderRadius: 8,
            background: testResult.success ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
            border: `1px solid ${testResult.success ? "#10b981" : "#ef4444"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: testResult.content ? 10 : 0 }}>
              {testResult.success ? (
                <CheckCircle2 size={14} style={{ color: "#10b981" }} />
              ) : (
                <AlertTriangle size={14} style={{ color: "#ef4444" }} />
              )}
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                {testResult.success ? "Succès" : "Échec"}
              </span>
              {testResult.model && (
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>— {testResult.model}</span>
              )}
              {testResult.latency_ms != null && (
                <span style={{ fontSize: 12, color: "var(--text-tertiary)", marginLeft: "auto", display: "flex", alignItems: "center", gap: 3 }}>
                  <Clock size={11} />{fmtLatency(testResult.latency_ms)}
                </span>
              )}
            </div>
            {testResult.content && (
              <pre style={{
                margin: 0, fontSize: 12, color: "var(--text-secondary)",
                whiteSpace: "pre-wrap", wordBreak: "break-word",
                background: "var(--bg-primary)", padding: 10, borderRadius: 6,
              }}>
                {testResult.content}
              </pre>
            )}
            {testResult.error && (
              <p style={{ margin: 0, fontSize: 12, color: "#ef4444" }}>{testResult.error}</p>
            )}
          </div>
        )}
      </section>

      {/* ── Logs récents ───────────────────────────────────────────────────── */}
      <section style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 20,
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>
          <Clock size={15} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
          Logs récents
          <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-tertiary)", marginLeft: 6 }}>
            ({logs.length})
          </span>
        </h2>

        {logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <Clock size={28} style={{ color: "var(--text-tertiary)", marginBottom: 8 }} />
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0 }}>
              Aucun log disponible — activez le logging dans la configuration ci-dessus.
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["Heure", "Tâche", "Provider", "Modèle", "Latence", "Tokens", "Fallback", "Statut"].map((h) => (
                      <th key={h} style={{
                        padding: "6px 10px", textAlign: "left",
                        color: "var(--text-tertiary)", fontWeight: 500,
                        borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "7px 10px", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
                        {relativeTime(log.createdAt)}
                      </td>
                      <td style={{ padding: "7px 10px", fontFamily: "monospace", fontSize: 11, color: "var(--text-secondary)" }}>
                        {log.task}
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        <span style={{
                          display: "inline-block", padding: "2px 7px", borderRadius: 4,
                          fontSize: 11, fontWeight: 500,
                          background: `${PROVIDER_COLORS[log.provider] ?? "#888"}22`,
                          color: PROVIDER_COLORS[log.provider] ?? "var(--text-secondary)",
                        }}>
                          {log.provider}
                        </span>
                      </td>
                      <td style={{
                        padding: "7px 10px", fontFamily: "monospace", fontSize: 11,
                        color: "var(--text-tertiary)", maxWidth: 140,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {log.model}
                      </td>
                      <td style={{ padding: "7px 10px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                        {fmtLatency(log.latencyMs)}
                      </td>
                      <td style={{ padding: "7px 10px", color: "var(--text-tertiary)" }}>
                        {log.tokensUsed ?? "—"}
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        {log.fallbackUsed ? (
                          <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 500 }}>↳ fallback</span>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        {log.success ? (
                          <CheckCircle2 size={13} style={{ color: "#10b981" }} />
                        ) : (
                          <span title={log.error ?? "Erreur inconnue"}>
                            <XCircle size={13} style={{ color: "#ef4444" }} />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {logs.length > 10 && (
              <button
                onClick={() => setLogsExpanded((v) => !v)}
                style={{
                  marginTop: 12, display: "flex", alignItems: "center", gap: 4,
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, color: "var(--blue)", padding: 0,
                }}
              >
                {logsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {logsExpanded
                  ? "Afficher moins"
                  : `Voir les ${logs.length - 10} entrées supplémentaires`}
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
