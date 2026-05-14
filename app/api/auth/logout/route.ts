export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST() {
  try {
    await signOut({ redirect: false });
  } catch {
    // Session already invalid — treat as success
  }

  const response = NextResponse.json({ ok: true });
  // Clear the session cookie manually as a safety net
  response.cookies.set("next-auth.session-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("__Secure-next-auth.session-token", "", { maxAge: 0, path: "/" });
  return response;
}
