// app/api/processes/catalog/route.ts
// GET — retourne le catalogue SAP/LeanIX filtré

import { NextResponse } from "next/server";
import { auth }         from "@/lib/auth";
import { PROCESS_CATALOGUE } from "@/lib/seed/process-catalogue";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url    = new URL(req.url);
  const domain = url.searchParams.get("domain");
  const level  = url.searchParams.get("level");
  const q      = url.searchParams.get("q")?.toLowerCase();

  let items = PROCESS_CATALOGUE.flatMap((d) => {
    const l2 = d.children ?? [];
    const l3 = l2.flatMap((c) => c.children ?? []);
    return [
      { ...d, children: undefined },
      ...l2.map((c) => ({ ...c, children: undefined })),
      ...l3,
    ];
  });

  if (domain) items = items.filter((i) => i.code.startsWith(domain));
  if (level)  items = items.filter((i) => i.level === Number(level));
  if (q)      items = items.filter((i) =>
    i.name_fr.toLowerCase().includes(q) ||
    i.code.toLowerCase().includes(q)
  );

  return NextResponse.json({ items, total: items.length });
}
