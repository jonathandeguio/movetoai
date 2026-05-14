import { CheckSquare, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock task data — connect to a Task model when available
const MOCK_TASKS = [
  {
    id: "t1",
    title: "Valider la clôture comptable de mars",
    process: "Clôture mensuelle",
    dueDate: "2026-04-10",
    status: "pending",
    priority: "high",
  },
  {
    id: "t2",
    title: "Vérifier les demandes d'absence de l'équipe",
    process: "Gestion des absences RH",
    dueDate: "2026-04-08",
    status: "pending",
    priority: "medium",
  },
  {
    id: "t3",
    title: "Répondre aux 3 tickets support en attente",
    process: "Support client IA",
    dueDate: "2026-04-07",
    status: "in_progress",
    priority: "high",
  },
  {
    id: "t4",
    title: "Mettre à jour les données clients dans le CRM",
    process: "Relance commerciale",
    dueDate: "2026-04-05",
    status: "done",
    priority: "low",
  },
  {
    id: "t5",
    title: "Préparer le rapport de relance mensuel",
    process: "Relance commerciale",
    dueDate: "2026-04-15",
    status: "pending",
    priority: "medium",
  },
];

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; cls: string; dot: string }> = {
  pending: { label: "En attente", icon: Clock, cls: "text-[--amber]", dot: "bg-[--amber]" },
  in_progress: { label: "En cours", icon: AlertCircle, cls: "text-[--blue]", dot: "bg-[--blue]" },
  done: { label: "Terminé", icon: CheckCircle2, cls: "text-[--green]", dot: "bg-[--green]" },
};

const PRIORITY_BADGE: Record<string, string> = {
  high: "border-[--red-dim] bg-[--red-dim] text-[--red]",
  medium: "border-[--amber-border] bg-[--amber-dim] text-[--amber]",
  low: "border-[--border] bg-[--bg-hover] text-[--text-muted]",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "Urgent",
  medium: "Normal",
  low: "Faible",
};

export default function MemberTasksPage() {
  const pending = MOCK_TASKS.filter((t) => t.status === "pending").length;
  const inProgress = MOCK_TASKS.filter((t) => t.status === "in_progress").length;
  const done = MOCK_TASKS.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-[--text-primary]">Mes tâches</h1>
        <p className="text-sm text-[--text-muted]">Tâches qui vous ont été assignées dans ce workspace.</p>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "En attente", value: pending, cls: "text-[--amber]" },
          { label: "En cours", value: inProgress, cls: "text-[--blue]" },
          { label: "Terminées", value: done, cls: "text-[--green]" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 rounded-xl border border-[--border] bg-[--bg-card] px-4 py-2.5 shadow-sm">
            <span className={`text-xl font-semibold ${item.cls}`}>{item.value}</span>
            <span className="text-sm text-[--text-muted]">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Task list */}
      <Card className="border-[--border] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[--text-secondary]">
            <CheckSquare className="h-4 w-4 text-[--text-muted]" />
            Toutes mes tâches ({MOCK_TASKS.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-0">
          <div className="divide-y divide-[--border-subtle]">
            {MOCK_TASKS.map((task) => {
              const status = STATUS_CONFIG[task.status];
              const StatusIcon = status.icon;
              return (
                <div key={task.id} className="flex items-start gap-4 px-6 py-4 hover:bg-[--bg-hover] transition">
                  <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-[--text-primary] ${task.status === "done" ? "line-through text-[--text-muted]" : ""}`}>
                      {task.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[--text-muted]">{task.process}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_BADGE[task.priority]}`}>
                      {PRIORITY_LABEL[task.priority]}
                    </span>
                    <div className={`flex items-center gap-1 text-xs ${status.cls}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </div>
                    <span className="text-[11px] text-[--text-muted] font-mono">
                      {new Date(task.dueDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
