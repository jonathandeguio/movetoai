import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type {
  DomainFilters,
  DomainScope,
  ProcessFilters,
  ProcessFocus
} from "@/modules/business-structure/model/business-structure.types";

export type SearchParamValue = string | string[] | undefined;
export type SearchParamsRecord = Record<string, SearchParamValue>;

export { prisma };

export function getFirstValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function normalizeText(value: SearchParamValue) {
  return getFirstValue(value).trim();
}

export function normalizeDomainScope(value: SearchParamValue): DomainScope {
  const nextValue = getFirstValue(value);

  if (
    nextValue === "with-opportunities" ||
    nextValue === "without-opportunities" ||
    nextValue === "all"
  ) {
    return nextValue;
  }

  return "all";
}

export function normalizeProcessFocus(value: SearchParamValue): ProcessFocus {
  const nextValue = getFirstValue(value);

  if (
    nextValue === "linked-opportunities" ||
    nextValue === "with-pain-points" ||
    nextValue === "opportunity-whitespace" ||
    nextValue === "all"
  ) {
    return nextValue;
  }

  return "all";
}

export function buildDomainWhere(
  workspaceId: string,
  filters: DomainFilters
): Prisma.DomainWhereInput {
  const where: Prisma.DomainWhereInput = {
    workspaceId,
    deletedAt: null
  };

  if (filters.q) {
    where.OR = [
      {
        name: {
          contains: filters.q
        }
      },
      {
        description: {
          contains: filters.q
        }
      }
    ];
  }

  if (filters.businessUnitId) {
    where.businessUnitId = filters.businessUnitId;
  }

  if (filters.scope === "with-opportunities") {
    where.opportunities = {
      some: {
        deletedAt: null
      }
    };
  }

  if (filters.scope === "without-opportunities") {
    where.opportunities = {
      none: {
        deletedAt: null
      }
    };
  }

  return where;
}

export function buildProcessWhere(
  workspaceId: string,
  filters: ProcessFilters
): Prisma.ProcessWhereInput {
  const where: Prisma.ProcessWhereInput = {
    workspaceId,
    deletedAt: null
  };

  if (filters.q) {
    where.OR = [
      {
        name: {
          contains: filters.q
        }
      },
      {
        description: {
          contains: filters.q
        }
      },
      {
        owner: {
          name: {
            contains: filters.q
          }
        }
      }
    ];
  }

  if (filters.businessUnitId) {
    where.businessUnitId = filters.businessUnitId;
  }

  if (filters.focus === "linked-opportunities") {
    where.opportunities = {
      some: {
        deletedAt: null
      }
    };
  }

  if (filters.focus === "with-pain-points") {
    where.painPoints = {
      some: {
        deletedAt: null
      }
    };
  }

  if (filters.focus === "opportunity-whitespace") {
    where.opportunities = {
      none: {
        deletedAt: null
      }
    };
  }

  return where;
}
