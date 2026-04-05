import { cookies, headers } from "next/headers";

import { auth } from "@/lib/auth";
import { localeCookieName, normalizeLocale, type Locale } from "@/lib/i18n/config";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;

  if (cookieLocale) {
    return normalizeLocale(cookieLocale);
  }

  const session = await auth();

  if (session?.user?.preferredLocale) {
    return normalizeLocale(session.user.preferredLocale);
  }

  const headerStore = await headers();
  return normalizeLocale(headerStore.get("accept-language"));
}
