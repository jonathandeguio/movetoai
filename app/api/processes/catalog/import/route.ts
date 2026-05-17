// app/api/processes/catalog/import/route.ts
// POST — importe des processus du catalogue SAP/LeanIX dans le workspace

import { NextResponse }              from "next/server";
import { auth }                      from "@/lib/auth";
import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { prisma }                    from "@/lib/prisma";
import { PROCESS_CATALOGUE }         from "@/lib/seed/process-catalogue";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getCurrentWorkspaceContext();
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json() as { codes: string[] };
  if (!body.codes?.length) return NextResponse.json({ error: "codes requis" }, { status: 400 });

  // Flatten catalogue
  const allItems = PROCESS_CATALOGUE.flatMap((d) => {
    const l2 = d.children ?? [];
    const l3 = l2.flatMap((c) => c.children ?? []);
    return [d, ...l2, ...l3];
  });

  // Find domain for the workspace (use first domain available)
  const domain = await prisma.domain.findFirst({ where: { workspaceId: workspace.id } });
  if (!domain) return NextResponse.json({ error: "Aucun domaine dans ce workspace" }, { status: 400 });

  const results: { code: string; created: boolean }[] = [];

  for (const code of body.codes) {
    const item = allItems.find((i) => i.code === code);
    if (!item || item.level !== 3) continue;

    // Check si déjà importé
    const exists = await prisma.process.findFirst({
      where: { workspaceId: workspace.id, catalogCode: code },
    });

    if (exists) {
      results.push({ code, created: false });
      continue;
    }

    const slug = `${code.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;

    await prisma.process.create({
      data: {
        workspaceId:  workspace.id,
        domainId:     domain.id,
        name:         item.name_fr,
        slug,
        description:  item.description_fr ?? "",
        catalogCode:  item.code,
        aiPotential:  item.ai_potential ?? "medium",
        processStatus: "draft",
        maturityScore:  0,
        maturityLevel:  "initial",
      },
    });

    results.push({ code, created: true });
  }

  const created = results.filter((r) => r.created).length;
  return NextResponse.json({ results, created, skipped: results.length - created });
}
