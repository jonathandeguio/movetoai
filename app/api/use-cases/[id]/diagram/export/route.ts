export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id }         = await params;
  const { searchParams } = new URL(req.url);
  const format           = searchParams.get("format") ?? "bpmn";

  const diagram = await prisma.processDiagram.findUnique({
    where: { useCaseId: id },
    select: { xml: true, svg: true },
  });

  if (!diagram) return NextResponse.json({ error: "No diagram found" }, { status: 404 });

  if (format === "svg" && diagram.svg) {
    return new Response(diagram.svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="diagram.svg"`,
      },
    });
  }

  if (format === "bpmn") {
    return new Response(diagram.xml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="diagram.bpmn"`,
      },
    });
  }

  return NextResponse.json(
    { error: "Format non supporté côté serveur. Utilisez l'export client pour PNG." },
    { status: 400 }
  );
}
