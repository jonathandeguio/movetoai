"use server";

import { prisma } from "@/lib/prisma";
import { createWorkspaceForUser } from "@/server/onboarding";
import { getSectorItems, type CompanySize, type Sector } from "@/lib/onboarding/sector-config";
import { CERTIFICATION_CATALOG }  from "@/lib/seed/certifications";
import type { CertificationSelection } from "@/components/onboarding/CertificationOnboardingStep";
import type { Locale } from "@/lib/i18n/config";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OnboardingInput {
  // User identity
  userId:          string;
  preferredLocale: Locale;
  // Company basics
  companyName:    string;
  workspaceName:  string;
  // Sector intelligence
  sector:         Sector;
  companySize:    CompanySize;
  // Certifications (step 3)
  certifications?: CertificationSelection[];
  // Transformation ambition
  aiMaturity?:  string;
  priorities?:  string[];
  horizon?:     string;
}

export interface OnboardingResult {
  tenantId:      string;
  workspaceId:   string;
  workspaceSlug: string;
  seeded: {
    domains:           number;
    capabilities:      number;
    processes:         number;
    opportunities:     number;
    certifications:    number;   // obtained / in_progress
    certTargets:       number;   // planned
    certAutoAdded:     number;   // auto_sector (mandatory not declared)
    certLinks:         number;   // CertificationLink records auto-created
  };
}

// ── Text helpers ──────────────────────────────────────────────────────────────

/** Lowercase + strip accents + normalise separators for fuzzy matching. */
function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[-_]/g, " ")
    .trim();
}

/**
 * Returns true if a seeded domain name matches a certification's typicalDomain label.
 * Handles both direct inclusion and word-level overlap.
 */
function domainMatches(domainName: string, typicalLabel: string): boolean {
  const d = normalizeText(domainName);
  const t = normalizeText(typicalLabel);
  if (d === t || d.includes(t) || t.includes(d)) return true;
  // Word-level: any significant word (>2 chars) in the typical label found in domain name
  const words = t.split(/\s+/).filter((w) => w.length > 2);
  return words.some((w) => d.includes(w));
}

// ── Slug helper ───────────────────────────────────────────────────────────────

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "item";
}

async function uniqueSlug(
  workspaceId: string,
  model: "domain" | "capability" | "process",
  base: string
): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    let exists = false;
    if (model === "domain") {
      exists = !!(await prisma.domain.findUnique({
        where: { workspaceId_slug: { workspaceId, slug: candidate } },
        select: { id: true },
      }));
    } else if (model === "capability") {
      exists = !!(await prisma.capability.findUnique({
        where: { workspaceId_slug: { workspaceId, slug: candidate } },
        select: { id: true },
      }));
    } else {
      exists = !!(await prisma.process.findUnique({
        where: { workspaceId_slug: { workspaceId, slug: candidate } },
        select: { id: true },
      }));
    }
    if (!exists) return candidate;
  }
  return `${base}-${Date.now()}`;
}

// ── Main action ───────────────────────────────────────────────────────────────

export async function createWorkspaceFromOnboarding(
  input: OnboardingInput
): Promise<OnboardingResult> {

  // ── Step 1: Create workspace shell (or recover an existing partial one) ───────
  //
  // A previous attempt may have created the workspace (step 1 succeeded) but
  // then crashed at step 4 (certifications, stale Prisma client, etc.).
  // In that case `createWorkspaceForUser` throws ALREADY_ONBOARDED.
  // We recover by finding the existing workspace and completing the remaining steps.
  //
  let base: { tenantId: string; workspaceId: string; workspaceSlug: string };
  let isRecovery = false;

  try {
    base = await createWorkspaceForUser({
      userId:          input.userId,
      preferredLocale: input.preferredLocale,
      companyName:     input.companyName,
      workspaceName:   input.workspaceName,
      companySize:     input.companySize,
      sector:          input.sector,
    });
  } catch (err) {
    if (!(err instanceof Error) || err.message !== "ALREADY_ONBOARDED") throw err;

    // Recover: find the workspace that was partially created
    const membership = await prisma.membership.findFirst({
      where:  { userId: input.userId, status: "ACTIVE", deletedAt: null },
      select: {
        workspace: {
          select: { id: true, slug: true, tenantId: true },
        },
      },
    });

    if (!membership?.workspace) throw err;   // shouldn't happen — re-throw original error

    base = {
      tenantId:      membership.workspace.tenantId,
      workspaceId:   membership.workspace.id,
      workspaceSlug: membership.workspace.slug,
    };
    isRecovery = true;
    console.warn("[onboarding] Recovering partial workspace:", base.workspaceId);
  }

  const { workspaceId } = base;

  // ── Steps 2 & 3: Sector data + content seeding (skip in recovery) ───────────
  // In recovery mode the workspace + its domains/capabilities/processes were
  // already created in the first (partial) attempt. Re-running would create
  // duplicates. We only redo the cheap workspace.update to be safe.

  if (isRecovery) {
    // Re-apply sector metadata in case the first attempt partially updated it
    try {
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          sectorCode:  input.sector,
          companySize: input.companySize,
          aiMaturity:  input.aiMaturity  ?? null,
          priorities:  input.priorities  ? input.priorities : undefined,
          horizon:     input.horizon     ?? null,
        },
      });
    } catch { /* non-fatal */ }
  }

  // ── Step 2: Persist sector intelligence fields ───────────────────────────────
  if (!isRecovery) await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      sectorCode:  input.sector,
      companySize: input.companySize,
      aiMaturity:  input.aiMaturity  ?? null,
      priorities:  input.priorities  ? input.priorities : undefined,
      horizon:     input.horizon     ?? null,
    },
  });

  // ── Step 3: Seed sector content ──────────────────────────────────────────────
  const items = getSectorItems(input.sector, input.companySize);

  // Variables tracking seeding counts (populated only when !isRecovery)
  const domainMap:       Record<string, string>   = {};
  const capabilityMap:   Record<string, string>   = {};
  const capsByDomain:    Record<string, string[]> = {};
  const processByDomain: Record<string, string[]> = {};
  const domainProcessIndex: Array<{ domainName: string; processId: string }> = [];
  let opportunitiesCreated = 0;

  let allDomainNames: string[] = [];

  if (!isRecovery) {
    allDomainNames = Array.from(new Set([
      ...items.capabilities.map((c) => c.domain),
      ...items.processes.map((p) => p.domain),
      ...items.opportunities.map((o) => o.domain),
    ]));

    // 3a. Domains
    for (const name of allDomainNames) {
      const slug   = await uniqueSlug(workspaceId, "domain", toSlug(name));
      const domain = await prisma.domain.create({
        data: { workspaceId, name, slug },
        select: { id: true },
      });
      domainMap[name] = domain.id;
    }

    // 3b. Capabilities
    for (const cap of items.capabilities) {
      const domainId = domainMap[cap.domain];
      if (!domainId) continue;
      const slug   = await uniqueSlug(workspaceId, "capability", toSlug(cap.name));
      const record = await prisma.capability.create({
        data: { workspaceId, domainId, name: cap.name, slug, code: cap.code, isFromCatalog: true, aiPotential: cap.aiPotential, level: 0 },
        select: { id: true },
      });
      capabilityMap[cap.code] = record.id;
      capsByDomain[cap.domain] ??= [];
      capsByDomain[cap.domain].push(record.id);
    }

    // 3c. Processes
    for (const proc of items.processes) {
      const domainId    = domainMap[proc.domain];
      if (!domainId) continue;
      const capabilityId = capsByDomain[proc.domain]?.[0] ?? null;
      const slug         = await uniqueSlug(workspaceId, "process", toSlug(proc.name));
      const record       = await prisma.process.create({
        data: {
          workspaceId, domainId,
          capabilityId: capabilityId ?? undefined,
          name: proc.name, slug,
          aiPotential:   proc.aiPotential,
          painLevel:     proc.painLevel,
          frequency:     proc.frequency ?? null,
          processStatus: "active",
        },
        select: { id: true },
      });
      processByDomain[proc.domain] ??= [];
      processByDomain[proc.domain].push(record.id);
    }

    // Index: normalized domain name → process IDs (used for cert linking below)
    for (const [dName, pIds] of Object.entries(processByDomain)) {
      for (const pid of pIds) domainProcessIndex.push({ domainName: dName, processId: pid });
    }

    // 3d. Opportunity type
    let oppType = await prisma.opportunityType.findFirst({
      where: { workspaceId, isSystem: true },
      select: { id: true },
    });
    if (!oppType) {
      oppType = await prisma.opportunityType.create({
        data: { workspaceId, code: "AI_USE_CASE", name: "Cas d'usage IA", isSystem: true },
        select: { id: true },
      });
    }

    // 3e. Opportunities
    const fallbackCapId  = Object.values(capabilityMap)[0] ?? null;
    const fallbackProcId = Object.values(processByDomain).flat()[0] ?? null;

    if (fallbackCapId && fallbackProcId) {
      for (const opp of items.opportunities) {
        const domainId    = domainMap[opp.domain] ?? Object.values(domainMap)[0];
        if (!domainId) continue;
        const capabilityId = capsByDomain[opp.domain]?.[0] ?? fallbackCapId;
        const processId    = processByDomain[opp.domain]?.[0] ?? fallbackProcId;
        await prisma.opportunity.create({
          data: {
            workspaceId, domainId, capabilityId, processId,
            opportunityTypeId: oppType.id,
            title:        opp.title,
            status:       "DRAFT",
            badge:        "NONE",
            dataReadiness: "UNKNOWN",
            riskSeverity:  "MEDIUM",
            detectedBy:    "ai",
            complexity:    opp.complexity,
            priorityLevel: opp.priority,
            gainEstimate:  opp.gainEstimate ?? null,
            domainLabel:   opp.domain,
          },
        });
        opportunitiesCreated++;
      }
    }
  }

  // ── Step 4: Certifications (non-fatal — stale Prisma client or missing seed
  //   must not block workspace creation) ─────────────────────────────────────────
  let certCurrentCount = 0;
  let certTargetCount  = 0;
  let certAutoCount    = 0;
  let certLinksCount   = 0;

  try {
    const userSelections = input.certifications ?? [];
    const declaredCodes  = new Set(userSelections.map((c) => c.code));

    // Track created certs for the auto-linking step
    const createdCerts: Array<{ wcId: string; catalogCode: string }> = [];

    // 4a. User-declared certifications (current + target)
    for (const sel of userSelections) {
      const catalog = await prisma.certificationCatalog.findUnique({
        where: { code: sel.code },
        select: { id: true, validityYears: true },
      });
      if (!catalog) continue;

      const isCurrent = sel.type === "current";
      const status    = isCurrent ? "obtained" : "planned";
      const source    = isCurrent ? "onboarding_current" : "onboarding_target";

      // Auto-calculate expiry from obtainedDate + validityYears if not provided
      let expiryDate: Date | null = null;
      if (isCurrent && sel.obtainedDate) {
        if (sel.expiryDate) {
          expiryDate = new Date(sel.expiryDate);
        } else if (catalog.validityYears) {
          expiryDate = new Date(
            new Date(sel.obtainedDate).getTime() +
            catalog.validityYears * 365 * 24 * 60 * 60 * 1000
          );
        }
      }

      try {
        const wc = await prisma.workspaceCertification.create({
          data: {
            workspaceId,
            catalogId:    catalog.id,
            status,
            source,
            ownerId:      input.userId,
            obtainedDate: isCurrent && sel.obtainedDate ? new Date(sel.obtainedDate) : null,
            expiryDate,
            notes: !isCurrent && sel.horizon
              ? `Visée lors de l'onboarding — horizon : ${sel.horizon}`
              : null,
          },
          select: { id: true },
        });
        createdCerts.push({ wcId: wc.id, catalogCode: sel.code });
        if (isCurrent) certCurrentCount++;
        else           certTargetCount++;
      } catch {
        // skip duplicates
      }
    }

    // 4b. Auto-add mandatory certifications not declared by the user
    const sizeOrder = ["tpe", "pme", "eti", "ge"];
    const sizeIdx   = sizeOrder.indexOf(input.companySize);

    const mandatoryCodes = CERTIFICATION_CATALOG.filter((c) => {
      if (!c.isMandatory) return false;
      if (c.sectors && !c.sectors.includes(input.sector)) return false;
      if (c.sizeMin) {
        const minIdx = Math.min(...c.sizeMin.map((s) => sizeOrder.indexOf(s)));
        if (sizeIdx < minIdx) return false;
      }
      return true;
    }).map((c) => c.code);

    for (const code of mandatoryCodes) {
      if (declaredCodes.has(code)) continue;
      const catalog = await prisma.certificationCatalog.findUnique({
        where: { code },
        select: { id: true },
      });
      if (!catalog) continue;
      try {
        const wc = await prisma.workspaceCertification.create({
          data: {
            workspaceId,
            catalogId: catalog.id,
            status:    "planned",
            source:    "auto_sector",
            ownerId:   input.userId,
            notes:     `Identifiée automatiquement comme obligatoire pour votre secteur.`,
          },
          select: { id: true },
        });
        createdCerts.push({ wcId: wc.id, catalogCode: code });
        certAutoCount++;
      } catch {
        // skip duplicates
      }
    }

    // 4c. Auto-link certifications ↔ processes via typical domain matching
    // For each certification, find catalog entry's typicalDomains, match against
    // seeded domain names, then link to all processes in those domains.
    for (const { wcId, catalogCode } of createdCerts) {
      const entry = CERTIFICATION_CATALOG.find((c) => c.code === catalogCode);
      if (!entry || !entry.typicalDomains.length) continue;

      const matchedProcessIds = new Set<string>();
      for (const typicalLabel of entry.typicalDomains) {
        for (const { domainName, processId } of domainProcessIndex) {
          if (domainMatches(domainName, typicalLabel)) {
            matchedProcessIds.add(processId);
          }
        }
      }

      for (const processId of matchedProcessIds) {
        try {
          await prisma.certificationLink.create({
            data: {
              workspaceCertificationId: wcId,
              entityType: "process",
              entityId:   processId,
              coverage:   "partial",
              notes:      "Lien suggéré automatiquement lors de l'onboarding",
            },
          });
          certLinksCount++;
        } catch {
          // skip duplicates (@@unique constraint)
        }
      }
    }
  } catch (certErr) {
    // Certifications are non-fatal — workspace is still valid and usable.
    // Certs can be added later from the compliance dashboard.
    console.warn("[onboarding] Certification step failed (non-fatal):", certErr);
  }

  // ── Step 6: Mark onboarding complete — ALWAYS runs, even if certs failed ─────
  await prisma.user.update({
    where: { id: input.userId },
    data: { hasCompletedProcessFocusOnboarding: true },
  });

  return {
    ...base,
    seeded: {
      domains:       allDomainNames.length,
      capabilities:  Object.keys(capabilityMap).length,
      processes:     Object.values(processByDomain).flat().length,
      opportunities: opportunitiesCreated,
      certifications: certCurrentCount,
      certTargets:    certTargetCount,
      certAutoAdded:  certAutoCount,
      certLinks:      certLinksCount,
    },
  };
}
