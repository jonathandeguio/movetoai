/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test seed — Move to AI · Reset complet + données d'édition
 *
 * Crée 4 workspaces, 7 profils utilisateurs complets, 11 opportunités
 * et 5 use cases couvrant tous les statuts de l'interface.
 *
 * Mot de passe universel : Test1234!
 *
 * Usage :
 *   node --env-file=.env.test prisma/seed-test.js
 *   npm run db:seed:test
 *   npm run db:seed:reset   ← clean + seed en une commande
 */

const { PrismaClient } = require("@prisma/client");
const { randomBytes, pbkdf2Sync } = require("node:crypto");

const prisma = new PrismaClient();

const TEST_PASSWORD = "Test1234!";
const TEST_TENANT_SLUGS = [
  "technolab-industries-test",
  "boutiquemode-sas-test",
  "groupe-alpha-test",
  "leroy-consulting-test",
];
const TEST_EMAILS = [
  "admin@movetoai-test.dev",
  "ceo@movetoai-test.dev",
  "rh@movetoai-test.dev",
  "dsi@movetoai-test.dev",
  "consultant@movetoai-test.dev",
  "collab@movetoai-test.dev",
  "superadmin@movetoai-test.dev",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = pbkdf2Sync(password, salt, 310000, 32, "sha256");
  return `pbkdf2$310000$${salt}$${derivedKey.toString("hex")}`;
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// ── Cleanup (scoped to test slugs/emails only) ────────────────────────────────

async function cleanup() {
  console.log("  🧹 Suppression des données de test précédentes...");

  const testWorkspaces = await prisma.workspace.findMany({
    where: { tenant: { slug: { in: TEST_TENANT_SLUGS } } },
    select: { id: true },
  });
  const wsIds = testWorkspaces.map((w) => w.id);

  if (wsIds.length > 0) {
    // Leaf nodes first — strict FK order
    await prisma.processDiagram.deleteMany({
      where: { useCase: { workspaceId: { in: wsIds } } },
    });
    await prisma.useCase.deleteMany({ where: { workspaceId: { in: wsIds } } });
    await prisma.opportunity.deleteMany({ where: { workspaceId: { in: wsIds } } });
    await prisma.opportunityType.deleteMany({ where: { workspaceId: { in: wsIds } } });
    await prisma.process.deleteMany({ where: { workspaceId: { in: wsIds } } });
    await prisma.capability.deleteMany({ where: { workspaceId: { in: wsIds } } });
    await prisma.domain.deleteMany({ where: { workspaceId: { in: wsIds } } });
    await prisma.membership.deleteMany({ where: { workspaceId: { in: wsIds } } });
    await prisma.role.deleteMany({ where: { workspaceId: { in: wsIds } } });
    await prisma.workspace.deleteMany({ where: { id: { in: wsIds } } });
  }

  await prisma.tenant.deleteMany({ where: { slug: { in: TEST_TENANT_SLUGS } } });
  await prisma.user.deleteMany({ where: { email: { in: TEST_EMAILS } } });

  console.log("  ✅ Nettoyage terminé.");
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Move to AI — Seed des données de test...\n");

  await cleanup();

  const hash = hashPassword(TEST_PASSWORD);

  // ════════════════════════════════════════════════════════════
  // 1. PLAN D'ABONNEMENT
  // ════════════════════════════════════════════════════════════
  console.log("📦 Plan d'abonnement...");

  let proPlan = await prisma.subscriptionPlan.findFirst({
    where: { planType: "PRO" },
  });
  if (!proPlan) {
    proPlan = await prisma.subscriptionPlan.create({
      data: {
        planType: "PRO",
        name: "Pro",
        description: "Plan Pro — workspaces de test.",
        displayOrder: 2,
      },
    });
    console.log("  ✅ Plan PRO créé.");
  } else {
    console.log("  ✅ Plan PRO existant réutilisé.");
  }

  // ════════════════════════════════════════════════════════════
  // 2. PERMISSIONS
  // ════════════════════════════════════════════════════════════
  const permDefs = [
    ["workspace.view",          "View workspace"],
    ["workspace.manage",        "Manage workspace"],
    ["users.manage",            "Manage users"],
    ["opportunities.manage",    "Manage opportunities"],
    ["analytics.view",          "View analytics"],
    ["settings.manage",         "Manage settings"],
    ["use-cases.manage",        "Manage use cases"],
    ["reports.view",            "View reports"],
  ];

  const permMap = {};
  for (const [key, name] of permDefs) {
    let perm = await prisma.permission.findFirst({ where: { key } });
    if (!perm) {
      perm = await prisma.permission.create({ data: { key, name } });
    }
    permMap[key] = perm;
  }

  // ════════════════════════════════════════════════════════════
  // 3. UTILISATEURS (7 profils complets)
  // ════════════════════════════════════════════════════════════
  console.log("\n👤 Création des utilisateurs...");

  // ── Sophie Marchand · Admin Workspace ──────────────────────
  const sophie = await prisma.user.create({
    data: {
      name:           "Sophie Marchand",
      email:          "admin@movetoai-test.dev",
      hashedPassword: hash,
      status:         "ACTIVE",
      preferredLocale: "FR",
      jobTitle:       "Directrice de la Transformation Digitale",
      hasCompletedProcessFocusOnboarding: true,
      lastLoginAt:    daysAgo(1),
      preferences: {
        // Profil personnel
        phone:          "+33 6 11 22 33 44",
        bio:            "Responsable de la transformation IA chez Technolab depuis 2022. Ex-consultante Accenture.",
        avatarColor:    "#38bdf8",
        avatarInitials: "SM",
        linkedinUrl:    "https://linkedin.com/in/sophie-marchand-demo",
        department:     null,
        theme:          "light",
        // Notifications
        notificationsEmail: true,
        notificationsApp:   true,
        weeklyReport:       true,
        language:           "fr",
        // Onboarding IA
        aiAmbition:     "operational_efficiency",
        aiHorizon:      "6_months",
        aiMaturity:     "early_experiments",
        // Navigation
        homePage:       "opportunities",
        // Méta
        role:           "workspace_admin",
      },
    },
  });

  // ── Laurent Fontaine · Dirigeant (PDG) ─────────────────────
  const laurent = await prisma.user.create({
    data: {
      name:           "Laurent Fontaine",
      email:          "ceo@movetoai-test.dev",
      hashedPassword: hash,
      status:         "ACTIVE",
      preferredLocale: "FR",
      jobTitle:       "Président Directeur Général",
      hasCompletedProcessFocusOnboarding: true,
      lastLoginAt:    daysAgo(2),
      preferences: {
        phone:          "+33 6 22 33 44 55",
        bio:            "PDG de Technolab Industries depuis 2018. Membre du CA du MEDEF Auvergne-Rhône-Alpes.",
        avatarColor:    "#a78bfa",
        avatarInitials: "LF",
        linkedinUrl:    "https://linkedin.com/in/laurent-fontaine-demo",
        department:     null,
        theme:          "dark",
        notificationsEmail: false,
        notificationsApp:   true,
        weeklyReport:       true,
        language:           "fr",
        aiAmbition:     "cost_reduction",
        aiHorizon:      "6_months",
        aiMaturity:     "early_experiments",
        homePage:       "overview",
        role:           "executive",
      },
    },
  });

  // ── Isabelle Durand · Responsable Métier RH ────────────────
  const isabelle = await prisma.user.create({
    data: {
      name:           "Isabelle Durand",
      email:          "rh@movetoai-test.dev",
      hashedPassword: hash,
      status:         "ACTIVE",
      preferredLocale: "FR",
      jobTitle:       "Directrice des Ressources Humaines",
      hasCompletedProcessFocusOnboarding: true,
      lastLoginAt:    daysAgo(3),
      preferences: {
        phone:          "+33 6 33 44 55 66",
        bio:            "DRH depuis 8 ans chez Technolab. Spécialiste GPEC et transformation des organisations. Certifiée HR Analytics.",
        avatarColor:    "#6ee7b7",
        avatarInitials: "ID",
        department:     "RH",
        theme:          "system",
        notificationsEmail: true,
        notificationsApp:   true,
        weeklyReport:       false,
        language:           "fr",
        teamSize:       "21-100",
        challenges: [
          "Gestion des candidatures et recrutement",
          "Suivi des absences et congés",
          "Onboarding des nouveaux collaborateurs",
        ],
        toolsUsed:      ["BambooHR", "Excel", "Teams"],
        role:           "business_owner",
        homePage:       "opportunities",
      },
    },
  });

  // ── Thomas Renard · DSI ─────────────────────────────────────
  const thomas = await prisma.user.create({
    data: {
      name:           "Thomas Renard",
      email:          "dsi@movetoai-test.dev",
      hashedPassword: hash,
      status:         "ACTIVE",
      preferredLocale: "FR",
      jobTitle:       "Directeur des Systèmes d'Information",
      hasCompletedProcessFocusOnboarding: true,
      lastLoginAt:    daysAgo(1),
      preferences: {
        phone:          "+33 6 44 55 66 77",
        bio:            "DSI Technolab depuis 5 ans. Architecte SI de formation. Expert intégration ERP SAP et conformité RGPD.",
        avatarColor:    "#38bdf8",
        avatarInitials: "TR",
        department:     "IT",
        theme:          "dark",
        notificationsEmail: true,
        notificationsApp:   false,
        weeklyReport:       true,
        language:           "fr",
        techStack:      ["SAP ERP", "Salesforce CRM", "Microsoft Teams", "Power BI", "Azure AD"],
        mainConstraint: "rgpd",
        teamSize:       "6-20",
        role:           "it_manager",
        homePage:       "processes",
      },
    },
  });

  // ── Marc Leroy · Consultant IA ──────────────────────────────
  const marc = await prisma.user.create({
    data: {
      name:           "Marc Leroy",
      email:          "consultant@movetoai-test.dev",
      hashedPassword: hash,
      status:         "ACTIVE",
      preferredLocale: "FR",
      jobTitle:       "Consultant Senior en Transformation IA",
      hasCompletedProcessFocusOnboarding: true,
      lastLoginAt:    daysAgo(1),
      preferences: {
        phone:          "+33 6 55 66 77 88",
        bio:            "12 ans d'expérience en transformation digitale. Spécialisé automatisation des processus métier. Certifié Claude, Make et n8n.",
        avatarColor:    "#fb923c",
        avatarInitials: "ML",
        linkedinUrl:    "https://linkedin.com/in/marc-leroy-ia-demo",
        websiteUrl:     "https://leroy-consulting-demo.fr",
        department:     null,
        theme:          "dark",
        notificationsEmail: true,
        notificationsApp:   true,
        weeklyReport:       true,
        language:           "fr",
        specialization: "process_automation",
        experienceYears: "3-7",
        sectors:        ["Industrie", "Commerce/Retail", "Finance"],
        toolsIa:        ["Make.com", "Claude API", "n8n", "Flowise", "Zapier"],
        role:           "consultant_partner",
        homePage:       "overview",
      },
    },
  });

  // ── Amélie Petit · Collaborateur ────────────────────────────
  const amelie = await prisma.user.create({
    data: {
      name:           "Amélie Petit",
      email:          "collab@movetoai-test.dev",
      hashedPassword: hash,
      status:         "ACTIVE",
      preferredLocale: "FR",
      jobTitle:       "Assistante RH & Chargée de mission QVCT",
      hasCompletedProcessFocusOnboarding: false,
      lastLoginAt:    daysAgo(7),
      preferences: {
        phone:          "+33 6 66 77 88 99",
        bio:            "Assistante RH depuis 3 ans chez Technolab. En charge du suivi des absences et de l'onboarding.",
        avatarColor:    "#94a3b8",
        avatarInitials: "AP",
        department:     "RH",
        theme:          "system",
        notificationsEmail: true,
        notificationsApp:   true,
        weeklyReport:       false,
        language:           "fr",
        invitedByName:  "Isabelle Durand",
        role:           "member",
        homePage:       "opportunities",
      },
    },
  });

  // ── Alex Martin · Super Admin (interne Move to AI) ──────────
  const superadmin = await prisma.user.create({
    data: {
      name:           "Alex Martin",
      email:          "superadmin@movetoai-test.dev",
      hashedPassword: hash,
      status:         "ACTIVE",
      preferredLocale: "FR",
      jobTitle:       "Product Manager — Move to AI",
      hasCompletedProcessFocusOnboarding: true,
      lastLoginAt:    daysAgo(0),
      preferences: {
        phone:          "+33 6 77 88 99 00",
        bio:            "Product Manager chez Move to AI. Responsable du backlog produit et des relations partenaires.",
        avatarColor:    "#f87171",
        avatarInitials: "AM",
        department:     null,
        theme:          "dark",
        notificationsEmail: true,
        notificationsApp:   true,
        weeklyReport:       true,
        language:           "fr",
        isInternal:     true,
        role:           "super_admin",
        homePage:       "admin",
      },
    },
  });

  console.log("  ✅ 7 utilisateurs créés.");

  // ════════════════════════════════════════════════════════════
  // 4. WORKSPACES + RÔLES + MEMBRES
  // ════════════════════════════════════════════════════════════

  // ── Helper : crée tenant + workspace + 5 rôles système ─────
  async function createWorkspace({
    tenantSlug, tenantName, wsSlug, wsName, settings = {},
  }) {
    const tenant = await prisma.tenant.create({
      data: {
        name:               tenantName,
        slug:               tenantSlug,
        subscriptionPlanId: proPlan.id,
        subscriptionStatus: "ACTIVE",
        billingEmail:       `billing+${tenantSlug}@movetoai-test.dev`,
        settings:           { testMode: true },
      },
    });

    const ws = await prisma.workspace.create({
      data: {
        tenantId:      tenant.id,
        name:          wsName,
        slug:          wsSlug,
        defaultLocale: "FR",
        status:        "ACTIVE",
        settings:      { testMode: true, ...settings },
      },
    });

    const roleDefs = [
      {
        code: "WORKSPACE_ADMIN",
        name: "Workspace Admin",
        perms: ["workspace.view", "workspace.manage", "users.manage",
                "opportunities.manage", "analytics.view", "settings.manage",
                "governance.manage", "initiatives.manage", "scoring.manage",
                "integrations.manage", "billing.manage", "audit.view"],
      },
      {
        code: "ENTERPRISE_ARCHITECT",
        name: "Enterprise Architect",
        perms: ["workspace.view", "opportunities.manage", "analytics.view",
                "governance.manage", "scoring.manage", "integrations.manage", "audit.view"],
      },
      {
        code: "TRANSFORMATION_MANAGER",
        name: "Transformation Manager",
        perms: ["workspace.view", "opportunities.manage", "analytics.view",
                "governance.manage", "initiatives.manage", "scoring.manage"],
      },
    ];

    const roles = {};
    for (const rd of roleDefs) {
      roles[rd.code] = await prisma.role.create({
        data: {
          workspaceId: ws.id,
          code:        rd.code,
          name:        rd.name,
          isSystem:    true,
          permissions: {
            create: rd.perms
              .filter((k) => permMap[k])
              .map((k) => ({ permissionId: permMap[k].id })),
          },
        },
      });
    }

    return { tenant, ws, roles };
  }

  async function addMember({ userId, wsId, roleId, daysBack = 30 }) {
    return prisma.membership.create({
      data: {
        userId,
        workspaceId: wsId,
        roleId,
        status:       "ACTIVE",
        acceptedAt:   daysAgo(daysBack),
        lastActiveAt: daysAgo(Math.min(daysBack, 2)),
      },
    });
  }

  // ── Helper : crée domain + capability + process + oppTypes ──
  async function createStructure({ wsId, domainName, domainSlug,
    capName, capSlug, procName, procSlug }) {
    const domain = await prisma.domain.create({
      data: { workspaceId: wsId, name: domainName, slug: domainSlug,
              description: `Domaine ${domainName}.` },
    });
    const cap = await prisma.capability.create({
      data: { workspaceId: wsId, domainId: domain.id,
              name: capName, slug: capSlug },
    });
    const proc = await prisma.process.create({
      data: { workspaceId: wsId, domainId: domain.id,
              capabilityId: cap.id, name: procName, slug: procSlug },
    });
    // AUTOMATION type (upsert — shared code within workspace)
    const oppTypeAuto = await prisma.opportunityType.upsert({
      where: { workspaceId_code: { workspaceId: wsId, code: "AUTOMATION" } },
      update: {},
      create: { workspaceId: wsId, code: "AUTOMATION", name: "Automatisation",
                description: "Automatisation d'un processus répétitif.", isSystem: true },
    });
    const oppTypeAssist = await prisma.opportunityType.upsert({
      where: { workspaceId_code: { workspaceId: wsId, code: "ASSISTANT" } },
      update: {},
      create: { workspaceId: wsId, code: "ASSISTANT", name: "Assistant IA",
                description: "Assistant conversationnel ou copilote métier.", isSystem: true },
    });
    const oppTypeAnalysis = await prisma.opportunityType.upsert({
      where: { workspaceId_code: { workspaceId: wsId, code: "ANALYSIS" } },
      update: {},
      create: { workspaceId: wsId, code: "ANALYSIS", name: "Analyse prédictive",
                description: "Analyse de données ou modèle prédictif.", isSystem: true },
    });
    return { domain, cap, proc, oppTypeAuto, oppTypeAssist, oppTypeAnalysis };
  }

  // ── Helper : crée une opportunité ───────────────────────────
  async function createOpp({
    wsId, domainId, capId, procId, oppTypeId,
    title, summary, problemStatement, status,
    gainEstimate = null, domainLabel = null, complexity = "medium",
    priorityLevel = "P1", detectedBy = "manual", sourceText = null,
    rejectionReason = null, createdById = null, ownerId = null,
  }) {
    return prisma.opportunity.create({
      data: {
        workspaceId:      wsId,
        domainId,
        capabilityId:     capId,
        processId:        procId,
        opportunityTypeId: oppTypeId,
        createdById,
        ownerId,
        title,
        summary,
        problemStatement,
        status,
        gainEstimate,
        domainLabel,
        complexity,
        priorityLevel,
        detectedBy,
        sourceText,
        rejectionReason,
      },
    });
  }

  // ── 4a. Technolab Industries (ETI) ──────────────────────────
  console.log("\n  🏭 Technolab Industries...");

  const { ws: wsETI, roles: rolesETI } = await createWorkspace({
    tenantSlug: "technolab-industries-test",
    tenantName: "Technolab Industries",
    wsSlug:     "technolab-industries-test",
    wsName:     "Technolab Industries",
    settings: {
      sector:          "Industrie manufacturière",
      size:            "ETI",
      country:         "FR",
      website:         "https://technolab-demo.fr",
      aiMaturityScore: 34,
      onboardingCompleted: true,
      assistantEnabled:    true,
    },
  });

  await addMember({ userId: sophie.id,   wsId: wsETI.id, roleId: rolesETI.WORKSPACE_ADMIN.id,          daysBack: 60 });
  await addMember({ userId: laurent.id,  wsId: wsETI.id, roleId: rolesETI.TRANSFORMATION_MANAGER.id,    daysBack: 55 });
  await addMember({ userId: isabelle.id, wsId: wsETI.id, roleId: rolesETI.TRANSFORMATION_MANAGER.id,    daysBack: 50 });
  await addMember({ userId: thomas.id,   wsId: wsETI.id, roleId: rolesETI.ENTERPRISE_ARCHITECT.id,      daysBack: 50 });
  await addMember({ userId: marc.id,     wsId: wsETI.id, roleId: rolesETI.ENTERPRISE_ARCHITECT.id,      daysBack: 45 });
  await addMember({ userId: amelie.id,   wsId: wsETI.id, roleId: rolesETI.TRANSFORMATION_MANAGER.id,    daysBack: 30 });
  await addMember({ userId: superadmin.id, wsId: wsETI.id, roleId: rolesETI.WORKSPACE_ADMIN.id,   daysBack: 60 });

  // Business structure — domaines multiples pour wsETI
  const bsRH = await createStructure({
    wsId: wsETI.id,
    domainName: "RH", domainSlug: "rh-eti",
    capName: "Gestion des collaborateurs", capSlug: "gestion-collab-eti",
    procName: "Onboarding & offboarding", procSlug: "onboarding-eti",
  });
  const bsFinance = await createStructure({
    wsId: wsETI.id,
    domainName: "Finance", domainSlug: "finance-eti",
    capName: "Recouvrement", capSlug: "recouvrement-eti",
    procName: "Relances factures", procSlug: "relances-factures-eti",
  });
  const bsCommercial = await createStructure({
    wsId: wsETI.id,
    domainName: "Commercial", domainSlug: "commercial-eti",
    capName: "Qualification leads", capSlug: "qualification-leads-eti",
    procName: "Scoring CRM", procSlug: "scoring-crm-eti",
  });
  const bsMarketing = await createStructure({
    wsId: wsETI.id,
    domainName: "Marketing", domainSlug: "marketing-eti",
    capName: "Contenu digital", capSlug: "contenu-digital-eti",
    procName: "Création contenu", procSlug: "creation-contenu-eti",
  });
  const bsIT = await createStructure({
    wsId: wsETI.id,
    domainName: "IT", domainSlug: "it-eti",
    capName: "Reporting & BI", capSlug: "reporting-bi-eti",
    procName: "Pipeline données SAP-BI", procSlug: "pipeline-sap-bi-eti",
  });
  const bsSupport = await createStructure({
    wsId: wsETI.id,
    domainName: "Support", domainSlug: "support-eti",
    capName: "Service client", capSlug: "service-client-eti",
    procName: "Traitement tickets FAQ", procSlug: "tickets-faq-eti",
  });
  const bsProduction = await createStructure({
    wsId: wsETI.id,
    domainName: "Production", domainSlug: "production-eti",
    capName: "Maintenance industrielle", capSlug: "maintenance-indus-eti",
    procName: "Suivi équipements", procSlug: "suivi-equipements-eti",
  });

  console.log("  ✅ Technolab Industries créé (7 membres, 7 domaines).");

  // ── 4b. BoutiqueMode SAS (PME) ──────────────────────────────
  console.log("  👗 BoutiqueMode SAS...");

  const { ws: wsPME, roles: rolesPME } = await createWorkspace({
    tenantSlug: "boutiquemode-sas-test",
    tenantName: "BoutiqueMode SAS",
    wsSlug:     "boutiquemode-sas-test",
    wsName:     "BoutiqueMode SAS",
    settings: {
      sector: "Commerce / Retail", size: "PME", country: "FR",
      aiMaturityScore: 21, onboardingCompleted: true, assistantEnabled: false,
    },
  });

  await addMember({ userId: marc.id,      wsId: wsPME.id, roleId: rolesPME.WORKSPACE_ADMIN.id,         daysBack: 45 });
  await addMember({ userId: sophie.id,    wsId: wsPME.id, roleId: rolesPME.TRANSFORMATION_MANAGER.id,   daysBack: 30 });
  await addMember({ userId: superadmin.id, wsId: wsPME.id, roleId: rolesPME.WORKSPACE_ADMIN.id, daysBack: 45 });

  const bsPME = await createStructure({
    wsId: wsPME.id,
    domainName: "Support client", domainSlug: "support-pme",
    capName: "E-réputation", capSlug: "ereputation-pme",
    procName: "Gestion avis clients", procSlug: "avis-clients-pme",
  });

  console.log("  ✅ BoutiqueMode SAS créé.");

  // ── 4c. GroupeAlpha Finance (Grand groupe) ──────────────────
  console.log("  🏦 GroupeAlpha Finance...");

  const { ws: wsGrande, roles: rolesGrande } = await createWorkspace({
    tenantSlug: "groupe-alpha-test",
    tenantName: "GroupeAlpha Finance",
    wsSlug:     "groupe-alpha-test",
    wsName:     "GroupeAlpha Finance",
    settings: {
      sector: "Finance & Assurance", size: "Grand groupe", country: "FR",
      aiMaturityScore: 61, onboardingCompleted: true, assistantEnabled: true,
    },
  });

  await addMember({ userId: marc.id,      wsId: wsGrande.id, roleId: rolesGrande.ENTERPRISE_ARCHITECT.id,    daysBack: 40 });
  await addMember({ userId: sophie.id,    wsId: wsGrande.id, roleId: rolesGrande.TRANSFORMATION_MANAGER.id,  daysBack: 35 });
  await addMember({ userId: superadmin.id, wsId: wsGrande.id, roleId: rolesGrande.WORKSPACE_ADMIN.id,   daysBack: 40 });

  const bsGrande = await createStructure({
    wsId: wsGrande.id,
    domainName: "Juridique & Conformité", domainSlug: "juridique-gg",
    capName: "Audit documentaire", capSlug: "audit-doc-gg",
    procName: "Contrôle réglementaire AMF/ESMA", procSlug: "controle-amf-gg",
  });

  console.log("  ✅ GroupeAlpha Finance créé.");

  // ── 4d. Leroy Consulting (Partenaire) ───────────────────────
  console.log("  💼 Leroy Consulting...");

  const { ws: wsCons, roles: rolesCons } = await createWorkspace({
    tenantSlug: "leroy-consulting-test",
    tenantName: "Leroy Consulting",
    wsSlug:     "leroy-consulting-test",
    wsName:     "Leroy Consulting",
    settings: {
      sector: "Conseil & Services", size: "PME", country: "FR",
      isPartnerWorkspace: true, onboardingCompleted: true, assistantEnabled: true,
    },
  });

  await addMember({ userId: marc.id,       wsId: wsCons.id, roleId: rolesCons.WORKSPACE_ADMIN.id, daysBack: 30 });
  await addMember({ userId: superadmin.id, wsId: wsCons.id, roleId: rolesCons.WORKSPACE_ADMIN.id, daysBack: 30 });

  console.log("  ✅ Leroy Consulting créé.\n");

  // ════════════════════════════════════════════════════════════
  // 5. OPPORTUNITÉS — 8 statuts variés pour tests UI
  // ════════════════════════════════════════════════════════════
  console.log("💡 Création des opportunités...");

  // 1 · DRAFT — RH onboarding (signal AI)
  await createOpp({
    wsId: wsETI.id,
    domainId: bsRH.domain.id, capId: bsRH.cap.id, procId: bsRH.proc.id,
    oppTypeId: bsRH.oppTypeAuto.id,
    title:            "Automatiser l'onboarding des nouveaux collaborateurs",
    summary:          "Processus d'onboarding 100% manuel. Chaque arrivée mobilise 4h de l'équipe RH.",
    problemStatement: "Aucune automatisation sur le workflow d'onboarding. Risque d'erreurs, délais fréquents.",
    status:           "DRAFT",
    gainEstimate:     "-75% temps de traitement onboarding",
    complexity:       "medium",
    priorityLevel:    "P0",
    detectedBy:       "ai",
    domainLabel:      "RH",
    createdById:      isabelle.id,
    ownerId:          isabelle.id,
  });

  // 2 · VALIDATED — Finance (bouton "Convertir en use case" visible)
  await createOpp({
    wsId: wsETI.id,
    domainId: bsFinance.domain.id, capId: bsFinance.cap.id, procId: bsFinance.proc.id,
    oppTypeId: bsFinance.oppTypeAuto.id,
    title:            "Automatiser la relance des factures impayées",
    summary:          "L'équipe finance passe 3h par semaine à relancer manuellement. Taux recouvrement : 68%.",
    problemStatement: "Relances manuelles par email, aucune priorisation automatique des retards.",
    status:           "VALIDATED",
    gainEstimate:     "-80% temps relances · +15% taux recouvrement",
    complexity:       "low",
    priorityLevel:    "P0",
    detectedBy:       "manual",
    domainLabel:      "Finance",
    createdById:      sophie.id,
    ownerId:          isabelle.id,
  });

  // 3 · CONVERTED — Commercial leads (parent du use case 1)
  const oppLeads = await createOpp({
    wsId: wsETI.id,
    domainId: bsCommercial.domain.id, capId: bsCommercial.cap.id, procId: bsCommercial.proc.id,
    oppTypeId: bsCommercial.oppTypeAuto.id,
    title:            "Qualification automatique des leads entrants CRM Salesforce",
    summary:          "200 leads/mois traités manuellement. 20% qualifiés. Scoring prend 45min/lead.",
    problemStatement: "Pas de scoring automatique. Commerciaux perdent du temps sur des leads froids.",
    status:           "CONVERTED",
    gainEstimate:     "-60% temps qualification · +30% taux conversion",
    complexity:       "high",
    priorityLevel:    "P0",
    detectedBy:       "ai",
    domainLabel:      "Commercial",
    createdById:      sophie.id,
    ownerId:          sophie.id,
  });

  // 4 · REJECTED — Marketing posts LinkedIn (motif visible)
  await createOpp({
    wsId: wsETI.id,
    domainId: bsMarketing.domain.id, capId: bsMarketing.cap.id, procId: bsMarketing.proc.id,
    oppTypeId: bsMarketing.oppTypeAssist.id,
    title:            "Génération automatique de posts LinkedIn",
    summary:          "L'équipe marketing perd du temps à créer les publications LinkedIn chaque semaine.",
    problemStatement: "Création contenu répétitive mais nécessite une forte personnalisation.",
    status:           "REJECTED",
    gainEstimate:     "-50% temps création contenu",
    complexity:       "low",
    priorityLevel:    "P2",
    detectedBy:       "terrain",
    sourceText:       "On perd trop de temps sur les posts LinkedIn chaque semaine.",
    rejectionReason:  "Risque de perte d'authenticité de la marque. À reconsidérer en Q3 avec une approche hybride humain/IA.",
    domainLabel:      "Marketing",
    createdById:      amelie.id,
    ownerId:          sophie.id,
  });

  // 5 · DRAFT — Signal terrain RH (Amélie)
  await createOpp({
    wsId: wsETI.id,
    domainId: bsRH.domain.id, capId: bsRH.cap.id, procId: bsRH.proc.id,
    oppTypeId: bsRH.oppTypeAuto.id,
    title:            "Automatiser le suivi des demandes de congés",
    summary:          "Les demandes de congés transitent encore par email. Difficile de gérer les soldes.",
    problemStatement: "Processus entièrement manuel. Chevauchements non détectés, soldes calculés sur Excel.",
    status:           "DRAFT",
    gainEstimate:     "-2h/semaine · 0 erreur de solde",
    complexity:       "low",
    priorityLevel:    "P1",
    detectedBy:       "terrain",
    sourceText:       "Je passe trop de temps à gérer les congés par email, c'est impossible de suivre qui est absent quand.",
    domainLabel:      "RH",
    createdById:      amelie.id,
    ownerId:          isabelle.id,
  });

  // 6 · CONVERTED — IT pipeline SAP (parent du use case 3)
  const oppPipeline = await createOpp({
    wsId: wsETI.id,
    domainId: bsIT.domain.id, capId: bsIT.cap.id, procId: bsIT.proc.id,
    oppTypeId: bsIT.oppTypeAuto.id,
    title:            "Pipeline SAP → Power BI automatisé (H+1)",
    summary:          "Rapports Power BI générés manuellement chaque lundi depuis des exports SAP. 2h/semaine.",
    problemStatement: "Export manuel, données stales de 7 jours. Analyses stratégiques basées sur données obsolètes.",
    status:           "CONVERTED",
    gainEstimate:     "-90% temps reporting · données en quasi-temps réel",
    complexity:       "high",
    priorityLevel:    "P0",
    detectedBy:       "ai",
    domainLabel:      "IT",
    createdById:      thomas.id,
    ownerId:          thomas.id,
  });

  // 7 · VALIDATED — BoutiqueMode (vue PME consultant)
  await createOpp({
    wsId: wsPME.id,
    domainId: bsPME.domain.id, capId: bsPME.cap.id, procId: bsPME.proc.id,
    oppTypeId: bsPME.oppTypeAssist.id,
    title:            "Automatiser les réponses aux avis clients Google",
    summary:          "Gestion des avis Google prend 3h/semaine. Réponses tardives et non personnalisées.",
    problemStatement: "Pas de processus de réponse structuré. Impact négatif sur e-réputation.",
    status:           "VALIDATED",
    gainEstimate:     "-80% temps · réponse < 2h en moyenne",
    complexity:       "low",
    priorityLevel:    "P0",
    detectedBy:       "ai",
    domainLabel:      "Support",
    createdById:      marc.id,
    ownerId:          marc.id,
  });

  // 8 · DRAFT — Grand groupe conformité AMF
  await createOpp({
    wsId: wsGrande.id,
    domainId: bsGrande.domain.id, capId: bsGrande.cap.id, procId: bsGrande.proc.id,
    oppTypeId: bsGrande.oppTypeAnalysis.id,
    title:            "Conformité documentaire réglementaire AMF/ESMA",
    summary:          "Vérification manuelle des documents financiers. 40h/mois mobilisées par l'équipe juridique.",
    problemStatement: "Contrôles manuels sujets aux erreurs humaines. Risque de non-conformité réglementaire.",
    status:           "DRAFT",
    gainEstimate:     "-70% temps audit documentaire",
    complexity:       "high",
    priorityLevel:    "P0",
    detectedBy:       "ai",
    domainLabel:      "Juridique",
    createdById:      marc.id,
    ownerId:          marc.id,
  });

  // ── Opportunities dédiées aux use cases 2, 4, 5 (CONVERTED) ─
  const oppOnboarding = await createOpp({
    wsId: wsETI.id,
    domainId: bsRH.domain.id, capId: bsRH.cap.id, procId: bsRH.proc.id,
    oppTypeId: bsRH.oppTypeAuto.id,
    title:            "Workflow automatisé d'onboarding RH complet",
    summary:          "Automatisation de bout en bout du workflow d'onboarding : création comptes, envoi docs, relances.",
    problemStatement: "Chaque arrivée mobilise 4h RH sur des tâches 100% répétitives.",
    status:           "CONVERTED",
    gainEstimate:     "-4h RH par arrivée",
    complexity:       "medium", priorityLevel: "P0", detectedBy: "ai",
    domainLabel:      "RH", createdById: isabelle.id, ownerId: isabelle.id,
  });

  const oppChatbot = await createOpp({
    wsId: wsETI.id,
    domainId: bsSupport.domain.id, capId: bsSupport.cap.id, procId: bsSupport.proc.id,
    oppTypeId: bsSupport.oppTypeAssist.id,
    title:            "Chatbot IA support client FAQ — traitement autonome",
    summary:          "300 tickets/mois. 60% = questions récurrentes traitées manuellement par 2 agents.",
    problemStatement: "Agents support surchargés par les demandes répétitives. Délai moyen 4h.",
    status:           "CONVERTED",
    gainEstimate:     "-60% tickets humains · réponse < 2min",
    complexity:       "medium", priorityLevel: "P1", detectedBy: "ai",
    domainLabel:      "Support", createdById: sophie.id, ownerId: sophie.id,
  });

  const oppMaintenance = await createOpp({
    wsId: wsETI.id,
    domainId: bsProduction.domain.id, capId: bsProduction.cap.id, procId: bsProduction.proc.id,
    oppTypeId: bsProduction.oppTypeAnalysis.id,
    title:            "Maintenance prédictive machines industrielles (IoT + ML)",
    summary:          "Pannes détectées après coup. 15h d'arrêt moyen par incident non planifié.",
    problemStatement: "Maintenance curative uniquement. Coût moyen d'une panne non planifiée : 15 000€.",
    status:           "CONVERTED",
    gainEstimate:     "-75% arrêts non planifiés · 180 000€/an économisés",
    complexity:       "high", priorityLevel: "P1", detectedBy: "ai",
    domainLabel:      "Production", createdById: thomas.id, ownerId: thomas.id,
  });

  console.log("  ✅ 11 opportunités créées (8 showcase + 3 pour use cases).");

  // ════════════════════════════════════════════════════════════
  // 6. USE CASES (5 statuts différents)
  // ════════════════════════════════════════════════════════════
  console.log("\n📋 Création des use cases...");

  // ── Use Case 1 · BACKLOG — Scoring IA leads CRM ─────────────
  const uc1 = await prisma.useCase.create({
    data: {
      workspaceId:        wsETI.id,
      opportunityId:      oppLeads.id,
      title:              "Scoring IA des leads CRM Salesforce en temps réel",
      processDescription: "Les commerciaux scorent manuellement chaque lead sur 10 critères dans Salesforce. 45min/lead en moyenne. 200 leads/mois.",
      expectedOutcome:    "Score automatique généré en < 30s à chaque nouveau lead. Priorisation automatique des leads > 70%.",
      solutionType:       "automation",
      solutionDescription: "Modèle de scoring IA entraîné sur l'historique de conversion Salesforce. Intégration via API REST. Score affiché dans la fiche lead.",
      kpis: [
        { label: "Temps de scoring",     baseline: "45min/lead",  target: "30sec/lead", unit: "minutes" },
        { label: "Taux de conversion",   baseline: "20%",         target: "28%",        unit: "%"       },
        { label: "Leads traités/mois",   baseline: "200",         target: "200",        unit: "leads"   },
      ],
      roiEstimated: {
        savings_hours_per_month: 120,
        savings_euros_per_year:  54000,
        payback_months:          3,
        assumptions: "Base : 4 commerciaux à 45k€/an. 200 leads/mois × 45min économisées.",
      },
      effortDays:      18,
      effortBreakdown: { design: 3, development: 10, testing: 3, deployment: 2 },
      dataRequired: [
        { source: "Salesforce CRM",               type: "API REST", available: true  },
        { source: "Historique conversions 2022-2024", type: "CSV",  available: true  },
      ],
      risks: [
        { description: "Biais dans les données historiques",
          mitigation:  "Audit données avant entraînement", level: "medium" },
      ],
      recommendedTools: ["Claude API", "Salesforce Flow", "Python / Scikit-learn"],
      nextSteps: [
        "Audit du dataset Salesforce (qualité, complétude)",
        "Définition des features de scoring avec les commerciaux",
        "Entraînement du modèle v1",
        "Test A/B sur 30 leads",
      ],
      priorityLevel:  "P0",
      status:         "backlog",
      assignedTo:     isabelle.id,
      technicalOwner: thomas.id,
      consultantId:   marc.id,
    },
  });
  await prisma.opportunity.update({
    where: { id: oppLeads.id },
    data:  { useCaseId: uc1.id },
  });

  // ── Use Case 2 · ANALYSIS — Assistant IA onboarding RH ──────
  const uc2 = await prisma.useCase.create({
    data: {
      workspaceId:        wsETI.id,
      opportunityId:      oppOnboarding.id,
      title:              "Assistant IA onboarding RH automatisé",
      processDescription: "Onboarding 100% manuel : création comptes J-2, envoi documents J-1, relances complétion, rapport J+5.",
      expectedOutcome:    "Workflow entièrement automatisé. Zéro intervention RH sur les tâches administratives standard.",
      solutionType:       "automation",
      solutionDescription: "Workflow n8n déclenché à chaque nouvelle entrée BambooHR. Création automatique des comptes, envoi des emails via Teams, relances planifiées.",
      kpis: [
        { label: "Temps RH par onboarding",   baseline: "4h",  target: "45min", unit: "heures" },
        { label: "Taux complétion J+5",        baseline: "60%", target: "95%",   unit: "%"      },
        { label: "Satisfaction recrue (NPS)",  baseline: "32",  target: "68",    unit: "NPS"    },
      ],
      roiEstimated: {
        savings_hours_per_month: 26,
        savings_euros_per_year:  14000,
        payback_months:          5,
        assumptions: "Base : 1 RH à 38k€/an. 6-7 arrivées/mois. 3h économisées par dossier.",
      },
      effortDays:      12,
      effortBreakdown: { design: 2, development: 7, testing: 2, deployment: 1 },
      dataRequired: [
        { source: "BambooHR SIRH",      type: "API",      available: true  },
        { source: "Active Directory",   type: "LDAP",     available: true  },
        { source: "Templates RH Word",  type: "Fichiers", available: true  },
      ],
      risks: [
        { description: "Données RGPD collaborateurs",
          mitigation:  "Chiffrement + logs d'accès audités. DPO consulté.", level: "high" },
      ],
      recommendedTools: ["n8n", "BambooHR API", "Microsoft Graph API", "Claude API"],
      nextSteps: [
        "Cartographier les 23 étapes du workflow onboarding actuel",
        "Valider les accès API BambooHR avec Thomas",
        "Développer le workflow n8n v1 (création comptes)",
        "Test sur 3 arrivées en environnement de staging",
      ],
      priorityLevel:  "P0",
      status:         "analysis",
      assignedTo:     isabelle.id,
      technicalOwner: thomas.id,
      consultantId:   marc.id,
    },
  });
  await prisma.opportunity.update({
    where: { id: oppOnboarding.id },
    data:  { useCaseId: uc2.id },
  });

  // ── Use Case 3 · ACTIVE (65%) — Pipeline SAP → Power BI ─────
  const uc3 = await prisma.useCase.create({
    data: {
      workspaceId:        wsETI.id,
      opportunityId:      oppPipeline.id,
      title:              "Pipeline automatique SAP → Power BI (H+1)",
      processDescription: "Export manuel chaque lundi matin : 2h de manipulation Excel entre SAP et Power BI. Données stales de 7 jours.",
      expectedOutcome:    "Pipeline H+1 : données SAP dans Power BI en quasi-temps réel sans intervention humaine.",
      solutionType:       "automation",
      solutionDescription: "Connecteur Azure Data Factory (SAP BAPI → Azure SQL) + rafraîchissement Power BI planifié toutes les heures.",
      kpis: [
        { label: "Délai disponibilité données", baseline: "7 jours",  target: "1 heure", unit: "heures" },
        { label: "Temps traitement manuel",     baseline: "2h/sem",   target: "0h",      unit: "heures" },
        { label: "Fraîcheur des données",       baseline: "J-7",      target: "H-1",     unit: "heures" },
      ],
      roiEstimated: {
        savings_hours_per_month: 8,
        savings_euros_per_year:  6000,
        payback_months:          2,
        assumptions: "Base : 1 analyste à 42k€/an. 2h/semaine × 52 semaines.",
      },
      effortDays:      8,
      effortBreakdown: { design: 1, development: 5, testing: 1, deployment: 1 },
      dataRequired: [
        { source: "SAP ERP",  type: "API BAPI",   available: true },
        { source: "Power BI", type: "REST API",   available: true },
        { source: "Azure AD", type: "OAuth 2.0",  available: true },
      ],
      risks: [],
      recommendedTools: ["Azure Data Factory", "SAP BAPI Connector", "Power BI REST API"],
      nextSteps: [
        "Déploiement ADF en production (prévu 20 avril)",
        "Tests de charge (volumétrie SAP peak)",
        "Formation équipe reporting sur nouveaux dashboards",
      ],
      priorityLevel:  "P1",
      status:         "active",
      assignedTo:     thomas.id,
      technicalOwner: thomas.id,
    },
  });
  await prisma.opportunity.update({
    where: { id: oppPipeline.id },
    data:  { useCaseId: uc3.id },
  });

  // ── Use Case 4 · DEPLOYED — Chatbot IA support client FAQ ───
  const uc4 = await prisma.useCase.create({
    data: {
      workspaceId:        wsETI.id,
      opportunityId:      oppChatbot.id,
      title:              "Chatbot IA support client FAQ",
      processDescription: "300 tickets/mois. 60% = questions récurrentes traitées manuellement par 2 agents. Délai moyen de réponse : 4h.",
      expectedOutcome:    "Chatbot IA répond à 60% des demandes en autonomie. Agents concentrés sur les cas complexes.",
      solutionType:       "assistant",
      solutionDescription: "Chatbot Claude (RAG sur base de connaissances FAQ) intégré au widget support du site. Escalade automatique vers agent humain si score confiance < 80%.",
      kpis: [
        { label: "Tickets traités par IA",    baseline: "0%",   target: "60%",     unit: "%"       },
        { label: "Délai de réponse moyen",    baseline: "4h",   target: "< 2min",  unit: "minutes" },
        { label: "Satisfaction client (NPS)", baseline: "31",   target: "52",      unit: "NPS"     },
      ],
      roiEstimated: {
        savings_hours_per_month: 45,
        savings_euros_per_year:  22000,
        payback_months:          4,
        assumptions: "Base : 2 agents support à 32k€/an. 300 tickets × 60% automatisés.",
      },
      effortDays:      15,
      effortBreakdown: { design: 3, development: 8, testing: 2, deployment: 2 },
      dataRequired: [],
      risks:         [],
      recommendedTools: ["Claude API", "Crisp Chat", "Notion (base de connaissances)"],
      nextSteps: [
        "Enrichissement base de connaissances (objectif 65% couverture)",
        "Analyse des sujets non couverts (rapport mensuel)",
      ],
      priorityLevel:  "P1",
      status:         "deployed",
      deployedAt:     new Date("2025-01-15"),
      validatedBy:    laurent.id,
      validatedAt:    new Date("2024-12-20"),
      assignedTo:     sophie.id,
      technicalOwner: thomas.id,
      // Métriques réelles post-déploiement
      realKpis: [
        { label: "Tickets traités par IA",    realValue: "58%"          },
        { label: "Délai de réponse moyen",    realValue: "90 secondes"  },
        { label: "Satisfaction client (NPS)", realValue: "4.2/5"        },
        { label: "Heures économisées/mois",   realValue: "42h"          },
      ],
      realRoiAnalysis: "Légèrement sous l'objectif 60% (58% atteint). Performance principale conforme : délai de réponse réduit de 4h à 90s. Satisfaction client améliorée (+33%). Enrichissement de la base de connaissances prévu en mai pour atteindre 65%.",
    },
  });
  await prisma.opportunity.update({
    where: { id: oppChatbot.id },
    data:  { useCaseId: uc4.id },
  });

  // ── Use Case 5 · PAUSED — Maintenance prédictive (IoT) ──────
  const uc5 = await prisma.useCase.create({
    data: {
      workspaceId:        wsETI.id,
      opportunityId:      oppMaintenance.id,
      title:              "Maintenance prédictive des machines industrielles (IoT + ML)",
      processDescription: "Pannes détectées après coup. 8 arrêts non planifiés/an en moyenne. Coût moyen d'une panne : 15 000€.",
      expectedOutcome:    "Détection prédictive J-7 avant la panne. Réduction des arrêts non planifiés de 75%.",
      solutionType:       "analysis",
      solutionDescription: "Modèle ML (RandomForest) entraîné sur données IoT capteurs + historique maintenances SAP PM. Alertes automatiques via Teams.",
      kpis: [
        { label: "Arrêts non planifiés/an", baseline: "8",     target: "2",      unit: "incidents" },
        { label: "Coût maintenance/an",     baseline: "120k€", target: "30k€",   unit: "€"         },
        { label: "Disponibilité machines",  baseline: "91%",   target: "97.5%",  unit: "%"         },
      ],
      roiEstimated: {
        savings_hours_per_month: 10,
        savings_euros_per_year:  180000,
        payback_months:          2,
        assumptions: "Coût d'un arrêt : 15 000€ (15h arrêt × 1 000€/h). Réduction de 6 arrêts/an.",
      },
      effortDays:      45,
      effortBreakdown: { design: 8, development: 25, testing: 8, deployment: 4 },
      dataRequired: [
        { source: "Capteurs IoT machines",         type: "MQTT stream",     available: false },
        { source: "Historique maintenances SAP PM", type: "CSV / SAP BAPI", available: true  },
        { source: "Températures & vibrations",     type: "Capteurs OPC-UA", available: false },
      ],
      risks: [
        { description: "Capteurs IoT non installés sur les 12 machines principales",
          mitigation:  "Budget IoT de 35k€ soumis au COPIL du 15 avril 2025", level: "high" },
        { description: "Qualité des données historiques SAP PM (champs mal remplis)",
          mitigation:  "Audit données avec Thomas avant modélisation", level: "medium" },
      ],
      recommendedTools: ["Python / Scikit-learn", "Azure IoT Hub", "Azure ML", "SAP PM API"],
      nextSteps: [
        "Validation budget IoT en COPIL du 15 avril",
        "Appel d'offres installation capteurs (3 fournisseurs qualifiés)",
        "Démarrer audit données SAP PM en parallèle",
      ],
      priorityLevel: "P1",
      status:        "paused",
      constraints:   "En attente d'installation des capteurs IoT sur les 12 machines principales. Budget de 35k€ soumis au COPIL du 15 avril 2025. Reprise prévue en T3 2025.",
      assignedTo:    thomas.id,
      technicalOwner: thomas.id,
      consultantId:  marc.id,
    },
  });
  await prisma.opportunity.update({
    where: { id: oppMaintenance.id },
    data:  { useCaseId: uc5.id },
  });

  console.log("  ✅ 5 use cases créés (backlog · analyse · actif · déployé · pausé).\n");

  // ════════════════════════════════════════════════════════════
  // RÉCAPITULATIF
  // ════════════════════════════════════════════════════════════
  console.log("🎉 Seed terminé avec succès !\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Comptes de test  ·  Mot de passe universel : Test1234!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin Workspace  →  admin@movetoai-test.dev        (Sophie Marchand)");
  console.log("Dirigeant PDG    →  ceo@movetoai-test.dev          (Laurent Fontaine)");
  console.log("Resp. Métier RH  →  rh@movetoai-test.dev           (Isabelle Durand)");
  console.log("DSI / IT Manager →  dsi@movetoai-test.dev          (Thomas Renard)");
  console.log("Consultant IA    →  consultant@movetoai-test.dev   (Marc Leroy)");
  console.log("Collaborateur    →  collab@movetoai-test.dev       (Amélie Petit)");
  console.log("Super Admin      →  superadmin@movetoai-test.dev   (Alex Martin)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Workspaces créés : Technolab Industries · BoutiqueMode SAS");
  console.log("                   GroupeAlpha Finance · Leroy Consulting");
  console.log("Opportunités     : 11 (8 showcase + 3 parents de use cases)");
  console.log("Use cases        : 5 (backlog · analyse · actif · déployé · pausé)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
