import { SignJWT, jwtVerify, type JWTPayload } from "jose"

export interface TokenPayload extends JWTPayload {
  sub: string
  wid: string
  tid: string
  role: string
}

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set")
  return new TextEncoder().encode(secret)
}

export async function sign(payload: Omit<TokenPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getSecret())
}

export async function signRefresh(payload: Omit<TokenPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret())
}

export async function verify(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as TokenPayload
  } catch {
    return null
  }
}
