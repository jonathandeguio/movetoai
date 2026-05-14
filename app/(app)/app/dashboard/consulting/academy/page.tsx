import { redirect } from "next/navigation";
import { Award, CheckCircle2, Clock, Lock, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";

export const dynamic = "force-dynamic";

type CourseStatus = "available" | "in_progress" | "completed" | "locked";

const STATUS_CONFIG: Record<CourseStatus, { label: string; icon: React.ElementType; className: string }> = {
  available: { label: "Disponible", icon: Play, className: "text-[--blue] bg-[--blue-dim] border-[--blue-border]" },
  in_progress: { label: "En cours", icon: Clock, className: "text-[--amber] bg-[--amber-dim] border-[--amber-border]" },
  completed: { label: "Terminé", icon: CheckCircle2, className: "text-[--green] bg-[--green-dim] border-[--green-border]" },
  locked: { label: "Verrouillé", icon: Lock, className: "text-[--text-muted] bg-[--bg-hover] border-[--border]" },
};

const CERTIFICATIONS = [
  {
    id: "cert_1",
    name: "Move to AI Explorer",
    description: "Maîtrisez les fondamentaux de la plateforme et obtenez votre première certification.",
    duration: "3h",
    modules: 6,
    status: "in_progress" as CourseStatus,
    progress: 67,
    level: "Débutant",
    tierUnlock: "Explorer",
  },
  {
    id: "cert_2",
    name: "Move to AI Certified Partner",
    description: "Approfondissez votre maîtrise : gouvernance, portfolio, analytics avancés.",
    duration: "8h",
    modules: 14,
    status: "locked" as CourseStatus,
    progress: 0,
    level: "Intermédiaire",
    tierUnlock: "Certified",
  },
  {
    id: "cert_3",
    name: "Move to AI Expert",
    description: "Spécialisation avancée : stratégie IA multi-clients, architecture, co-vente.",
    duration: "12h",
    modules: 20,
    status: "locked" as CourseStatus,
    progress: 0,
    level: "Expert",
    tierUnlock: "Expert",
  },
];

const MODULES = [
  { id: "m1", title: "Introduction à Move to AI", duration: "20 min", completed: true, free: true },
  { id: "m2", title: "Naviguer dans le workspace client", duration: "30 min", completed: true, free: true },
  { id: "m3", title: "Cartographie des processus métier", duration: "45 min", completed: true, free: true },
  { id: "m4", title: "Capturer et qualifier les opportunités IA", duration: "40 min", completed: false, free: true },
  { id: "m5", title: "Utiliser les recommandations Claude", duration: "35 min", completed: false, free: true },
  { id: "m6", title: "Présenter les résultats au client", duration: "25 min", completed: false, free: true },
];

export default async function AcademyPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const completedModules = MODULES.filter((m) => m.completed).length;
  const progressPct = Math.round((completedModules / MODULES.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-[--text-primary]">
          Academy Move to AI
        </h1>
        <p className="text-sm text-[--text-muted]">
          Formations et certifications partenaires — Devenez expert Move to AI et faites-le valoir.
        </p>
      </div>

      {/* Current progress */}
      <div className="rounded-2xl border border-[--amber-border] bg-[--amber-dim] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Badge className="border-[--amber-border] bg-[--amber-dim] text-[--amber]">En cours</Badge>
            <h2 className="text-base font-semibold text-[--text-primary]">
              Move to AI Explorer
            </h2>
            <p className="text-sm text-[--text-secondary]">
              {completedModules}/{MODULES.length} modules complétés
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold text-[--amber]">{progressPct}%</p>
            <p className="text-xs text-[--text-disabled]">de progression</p>
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[--amber-dim]">
            <div
              className="h-full rounded-full bg-[--amber]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[--amber]">
            <span>{completedModules} terminés</span>
            <span>{MODULES.length - completedModules} restants</span>
          </div>
        </div>
        <Button className="mt-4 bg-[--amber] hover:bg-[--amber]">
          <Play className="mr-2 h-4 w-4" />
          Reprendre le module suivant
        </Button>
      </div>

      {/* Certifications */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-[--text-primary]">
          Parcours de certification
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {CERTIFICATIONS.map((cert) => {
            const config = STATUS_CONFIG[cert.status];
            const StatusIcon = config.icon;
            const isLocked = cert.status === "locked";
            return (
              <Card
                key={cert.id}
                className={`border-[--border] shadow-soft-sm ${isLocked ? "opacity-60" : "bg-[--bg-card]"}`}
              >
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Award
                        className={`h-6 w-6 ${
                          cert.tierUnlock === "Expert"
                            ? "text-[--purple]"
                            : cert.tierUnlock === "Certified"
                            ? "text-[--amber]"
                            : "text-[--text-muted]"
                        }`}
                      />
                      <Badge variant="outline" className="text-xs">
                        {cert.level}
                      </Badge>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </span>
                  </div>

                  <div>
                    <p className="font-semibold text-[--text-primary]">{cert.name}</p>
                    <p className="mt-1 text-xs leading-5 text-[--text-muted]">{cert.description}</p>
                  </div>

                  <div className="flex gap-3 text-xs text-[--text-disabled]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {cert.duration}
                    </span>
                    <span>{cert.modules} modules</span>
                  </div>

                  {cert.progress > 0 && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[--bg-hover]">
                      <div
                        className="h-full rounded-full bg-[--amber]"
                        style={{ width: `${cert.progress}%` }}
                      />
                    </div>
                  )}

                  <Button
                    size="sm"
                    className={`w-full ${isLocked ? "bg-[--bg-hover] text-[--text-muted] hover:bg-[--bg-hover]" : "bg-[--amber] hover:bg-[--amber]"}`}
                    disabled={isLocked}
                  >
                    {isLocked ? (
                      <><Lock className="mr-2 h-3.5 w-3.5" /> Débloque après {cert.tierUnlock === "Certified" ? "Explorer" : "Certified"}</>
                    ) : cert.status === "in_progress" ? (
                      <><Play className="mr-2 h-3.5 w-3.5" /> Continuer</>
                    ) : (
                      <><Play className="mr-2 h-3.5 w-3.5" /> Commencer</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Module list */}
      <Card className="border-[--border] bg-[--bg-card] shadow-soft-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Modules — Explorer (en cours)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {MODULES.map((mod, i) => (
            <div
              key={mod.id}
              className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                mod.completed
                  ? "border-[--green-border] bg-[--green-dim]"
                  : "border-[--border] bg-[--bg-card]"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  mod.completed ? "bg-[--green] text-[--on-green]" : "bg-[--bg-hover] text-[--text-muted]"
                }`}
              >
                {mod.completed ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${mod.completed ? "text-[--green] line-through" : "text-[--text-primary]"}`}>
                  {mod.title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[--text-disabled]">{mod.duration}</span>
                {!mod.completed && (
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-[--amber]">
                    <Play className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
