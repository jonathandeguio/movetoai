import type { Context } from "hono"

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function errorHandler(err: Error | ApiError, c: Context): Response {
  if (err instanceof ApiError) {
    return c.json({ error: { code: err.code, message: err.message } }, err.status as 400 | 401 | 403 | 404 | 409 | 422 | 500)
  }
  console.error(err)
  return c.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, 500)
}
