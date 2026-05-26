export interface PaginationInput {
  page?: string
  limit?: string
  sort?: string
}

export interface PaginationResult {
  skip: number
  take: number
  orderBy: Record<string, string>
}

export function parsePagination(query: PaginationInput): PaginationResult {
  const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "20", 10) || 20))
  const skip = (page - 1) * limit

  let orderBy: Record<string, string> = { createdAt: "desc" }

  if (query.sort) {
    const [field, dir] = query.sort.split(":")
    if (field) {
      orderBy = { [field]: dir === "asc" ? "asc" : "desc" }
    }
  }

  return { skip, take: limit, orderBy }
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): {
  data: T[]
  meta: { total: number; page: number; limit: number; pages: number }
} {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
}
