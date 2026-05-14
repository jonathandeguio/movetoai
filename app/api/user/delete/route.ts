export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const deleteSchema = z.object({
  confirmation: z.literal("SUPPRIMER"),
  password: z.string().min(1),
});

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hashedPassword: true },
  });

  if (!user) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const isValid = verifyPassword(parsed.data.password, user.hashedPassword);
  if (!isValid) {
    return NextResponse.json({ code: "WRONG_PASSWORD" }, { status: 400 });
  }

  // Soft delete
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      deletedAt: new Date(),
      status: "INACTIVE",
      email: `deleted-${session.user.id}@movetoai.deleted`,
    },
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set("next-auth.session-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("__Secure-next-auth.session-token", "", { maxAge: 0, path: "/" });
  return response;
}
