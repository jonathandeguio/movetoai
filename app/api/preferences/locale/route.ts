export const runtime = "nodejs";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import {
  localeCookieName,
  locales,
  toLocaleCode
} from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";

const localeSchema = z.object({
  locale: z.enum(locales)
});

export async function POST(request: Request) {
  try {
    const payload = localeSchema.parse(await request.json());
    const session = await auth();
    const cookieStore = await cookies();

    cookieStore.set(localeCookieName, payload.locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365
    });

    if (session?.user?.id) {
      await prisma.user.update({
        where: {
          id: session.user.id
        },
        data: {
          preferredLocale: toLocaleCode(payload.locale)
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ code: "INVALID_LOCALE" }, { status: 400 });
  }
}
