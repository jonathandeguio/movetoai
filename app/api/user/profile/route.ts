export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations/profile.schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      jobTitle: true,
      image: true,
      preferences: true,
      preferredLocale: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const prefs = user.preferences as Record<string, unknown> | null;

  return NextResponse.json({
    ...user,
    phone: typeof prefs?.phone === "string" ? prefs.phone : "",
    theme: typeof prefs?.theme === "string" ? prefs.theme : "system",
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "INVALID_PAYLOAD", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, jobTitle, phone } = parsed.data;

  // Check email uniqueness if changed
  if (email !== session.user.email) {
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id: session.user.id } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ code: "EMAIL_TAKEN" }, { status: 409 });
    }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  });

  const currentPrefs = (currentUser?.preferences as Record<string, unknown>) ?? {};

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      email,
      jobTitle: jobTitle ?? null,
      preferences: {
        ...currentPrefs,
        ...(phone !== undefined ? { phone } : {}),
      },
    },
  });

  return NextResponse.json({ ok: true });
}
