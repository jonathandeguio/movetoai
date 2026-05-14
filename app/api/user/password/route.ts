export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { passwordSchema } from "@/lib/validations/profile.schema";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = passwordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "INVALID_PAYLOAD", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hashedPassword: true },
  });

  if (!user) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const isValid = verifyPassword(parsed.data.currentPassword, user.hashedPassword);
  if (!isValid) {
    return NextResponse.json({ code: "WRONG_CURRENT_PASSWORD" }, { status: 400 });
  }

  const newHash = hashPassword(parsed.data.newPassword);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { hashedPassword: newHash },
  });

  return NextResponse.json({ ok: true });
}
