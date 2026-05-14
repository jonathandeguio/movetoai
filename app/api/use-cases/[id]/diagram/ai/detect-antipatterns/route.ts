export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

interface AntiPatternIssue {
  elementId:   string;
  elementType: string;
  severity:    "warning" | "error";
  message:     string;
}

/**
 * Algorithmic BPMN anti-pattern detection.
 * Parses the raw XML with regex to keep server-side bundle tiny
 * (no bpmn-js server import needed).
 */
function detectAntiPatterns(xml: string): AntiPatternIssue[] {
  const issues: AntiPatternIssue[] = [];

  // ── 1. Tasks / UserTasks with no name ──────────────────────────────────────
  const taskRe = /<bpmn:(?:task|userTask|serviceTask|scriptTask|sendTask|receiveTask)\s([^>]*?)>/gi;
  let m: RegExpExecArray | null;
  while ((m = taskRe.exec(xml)) !== null) {
    const attrs = m[1];
    const idMatch = attrs.match(/\bid="([^"]+)"/);
    const nameMatch = attrs.match(/\bname="([^"]*)"/);
    if (idMatch && (!nameMatch || !nameMatch[1].trim())) {
      issues.push({
        elementId:   idMatch[1],
        elementType: "task",
        severity:    "warning",
        message:     "Tâche sans nom — difficile à lire pour les parties prenantes.",
      });
    }
  }

  // ── 2. Gateways with only one outgoing sequence flow ──────────────────────
  const gatewayRe = /<bpmn:(?:exclusiveGateway|inclusiveGateway|parallelGateway)\s([^>]*?)\/>/gi;
  while ((m = gatewayRe.exec(xml)) !== null) {
    const attrs = m[1];
    const idMatch = attrs.match(/\bid="([^"]+)"/);
    if (idMatch) {
      const gwId = idMatch[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const outgoing = (xml.match(new RegExp(`sourceRef="${gwId}"`, "g")) ?? []).length;
      if (outgoing <= 1) {
        issues.push({
          elementId:   idMatch[1],
          elementType: "gateway",
          severity:    "warning",
          message:     "Passerelle avec un seul chemin sortant — inutile, simplifiez le diagramme.",
        });
      }
    }
  }

  // ── 3. Processes with no end event ─────────────────────────────────────────
  const hasEndEvent = /<bpmn:endEvent\b/i.test(xml);
  if (!hasEndEvent) {
    issues.push({
      elementId:   "Process_1",
      elementType: "process",
      severity:    "error",
      message:     "Aucun événement de fin — le processus n'a pas de terminaison explicite.",
    });
  }

  // ── 4. Processes with no start event ──────────────────────────────────────
  const hasStartEvent = /<bpmn:startEvent\b/i.test(xml);
  if (!hasStartEvent) {
    issues.push({
      elementId:   "Process_1",
      elementType: "process",
      severity:    "error",
      message:     "Aucun événement de début — le processus n'a pas de point d'entrée.",
    });
  }

  // ── 5. Events with no name ─────────────────────────────────────────────────
  const eventRe = /<bpmn:(?:startEvent|endEvent|intermediateCatchEvent|intermediateThrowEvent)\s([^>]*?)>/gi;
  while ((m = eventRe.exec(xml)) !== null) {
    const attrs = m[1];
    const idMatch = attrs.match(/\bid="([^"]+)"/);
    const nameMatch = attrs.match(/\bname="([^"]*)"/);
    if (idMatch && (!nameMatch || !nameMatch[1].trim())) {
      issues.push({
        elementId:   idMatch[1],
        elementType: "event",
        severity:    "warning",
        message:     "Événement sans nom — précisez le déclencheur ou le résultat.",
      });
    }
  }

  return issues;
}

export async function POST(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await getCurrentWorkspaceContext({ requireMembership: true });

  const diagram = await prisma.processDiagram.findUnique({
    where: { useCaseId: id },
    select: { xml: true },
  });
  if (!diagram) return NextResponse.json({ issues: [] });

  const issues = detectAntiPatterns(diagram.xml);
  return NextResponse.json({ issues, totalErrors: issues.filter(i => i.severity === "error").length, totalWarnings: issues.filter(i => i.severity === "warning").length });
}
