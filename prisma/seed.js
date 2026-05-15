/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, Prisma } = require("@prisma/client");
const { randomBytes, pbkdf2Sync } = require("node:crypto");

const prisma = new PrismaClient();

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "MoveToAI!2026";
const DEMO_TENANT_SLUG = "northstar-group-demo";
const DEMO_WORKSPACE_SLUG = "executive-ai-portfolio";

function localize(en, fr = en, es = en) {
  return { en, fr, es };
}

function decimal(value) {
  return new Prisma.Decimal(value.toFixed(2));
}

function preciseDecimal(value) {
  return new Prisma.Decimal(value.toFixed(4));
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function monthStart(offset = 0) {
  const date = new Date();
  date.setMonth(date.getMonth() + offset, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function monthEnd(offset = 0) {
  const start = monthStart(offset + 1);
  start.setMilliseconds(-1);
  return start;
}

function clamp(value, min = 1, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = pbkdf2Sync(password, salt, 310000, 32, "sha256");

  return `pbkdf2$310000$${salt}$${derivedKey.toString("hex")}`;
}

function proc(input) {
  return {
    description: `${input.name} is a recurring operating process in the demo workspace.`,
    sector: "shared",
    painPointSeverity: "MEDIUM",
    subProcesses: [],
    ...input
  };
}

function opp(slug, title, processSlug, overrides = {}) {
  return {
    slug,
    title,
    processSlug,
    typeCode: "COPILOT",
    status: "IDENTIFIED",
    badge: "STRATEGIC",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 240000,
    realizedValue: 0,
    baseScore: 70,
    tagSlugs: [],
    ...overrides
  };
}

const PLAN_DEFINITIONS = [
  {
    planType: "FREE",
    name: "Free",
    description: "Freemium entry point for process-first AI opportunity discovery.",
    displayOrder: 1,
    features: [
      ["CUSTOM_SCORING", "Custom scoring", false],
      ["ADVANCED_WORKFLOWS", "Advanced workflows", false],
      ["ADVANCED_EXPORTS", "Advanced exports", false],
      ["PORTFOLIO_GOVERNANCE", "Portfolio governance", false],
      ["ADVANCED_GOVERNANCE", "Advanced governance", false],
      ["MULTI_BUSINESS_UNIT", "Multiple business units", false],
      ["SSO", "SSO", false],
      ["SCIM", "SCIM", false],
      ["FULL_AUDIT", "Full audit trail", false],
      ["API_ACCESS", "API access", false],
      ["CENTRALIZED_ADMIN", "Centralized admin", false]
    ],
    limits: [
      ["WORKSPACES", "TENANT", "TOTAL", 1, "One workspace included"],
      ["USERS", "WORKSPACE", "TOTAL", 5, "Five users included"],
      ["PROCESSES", "WORKSPACE", "TOTAL", 15, "Up to fifteen processes"],
      ["OPPORTUNITIES", "WORKSPACE", "TOTAL", 30, "Up to thirty AI opportunities"],
      ["AI_REQUESTS_PER_MONTH", "WORKSPACE", "MONTHLY", 30, "Thirty AI requests per month"],
      ["BUSINESS_UNITS", "WORKSPACE", "TOTAL", 1, "Single business unit"]
    ]
  },
  {
    planType: "PRO",
    name: "Pro",
    description: "Shared portfolio workspace with governance and collaboration.",
    displayOrder: 2,
    features: [
      ["CUSTOM_SCORING", "Custom scoring", true],
      ["ADVANCED_WORKFLOWS", "Advanced workflows", true],
      ["ADVANCED_EXPORTS", "Advanced exports", true],
      ["PORTFOLIO_GOVERNANCE", "Portfolio governance", true],
      ["ADVANCED_GOVERNANCE", "Advanced governance", false],
      ["MULTI_BUSINESS_UNIT", "Multiple business units", false],
      ["SSO", "SSO", false],
      ["SCIM", "SCIM", false],
      ["FULL_AUDIT", "Full audit trail", false],
      ["API_ACCESS", "API access", false],
      ["CENTRALIZED_ADMIN", "Centralized admin", false]
    ],
    limits: [
      ["WORKSPACES", "TENANT", "TOTAL", 3, "Three workspaces included"],
      ["USERS", "WORKSPACE", "TOTAL", 50, "Fifty users included"],
      ["PROCESSES", "WORKSPACE", "TOTAL", 150, "Up to one hundred fifty processes"],
      ["OPPORTUNITIES", "WORKSPACE", "TOTAL", 300, "Up to three hundred opportunities"],
      ["AI_REQUESTS_PER_MONTH", "WORKSPACE", "MONTHLY", 1500, "Fifteen hundred AI requests per month"],
      ["BUSINESS_UNITS", "WORKSPACE", "TOTAL", 5, "Up to five business units"]
    ]
  },
  {
    planType: "ENTERPRISE",
    name: "Enterprise",
    description: "Centralized governance, trust controls, and scale across business units.",
    displayOrder: 3,
    features: [
      ["CUSTOM_SCORING", "Custom scoring", true],
      ["ADVANCED_WORKFLOWS", "Advanced workflows", true],
      ["ADVANCED_EXPORTS", "Advanced exports", true],
      ["PORTFOLIO_GOVERNANCE", "Portfolio governance", true],
      ["ADVANCED_GOVERNANCE", "Advanced governance", true],
      ["MULTI_BUSINESS_UNIT", "Multiple business units", true],
      ["SSO", "SSO", true],
      ["SCIM", "SCIM", true],
      ["FULL_AUDIT", "Full audit trail", true],
      ["API_ACCESS", "API access", true],
      ["CENTRALIZED_ADMIN", "Centralized admin", true]
    ],
    limits: [
      ["WORKSPACES", "TENANT", "TOTAL", 10, "Multi-workspace enterprise tenant"],
      ["USERS", "WORKSPACE", "TOTAL", 250, "Large operating team"],
      ["PROCESSES", "WORKSPACE", "TOTAL", 500, "Portfolio-wide process coverage"],
      ["OPPORTUNITIES", "WORKSPACE", "TOTAL", 1500, "Large opportunity portfolio"],
      ["AI_REQUESTS_PER_MONTH", "WORKSPACE", "MONTHLY", 12000, "High AI request allowance"],
      ["BUSINESS_UNITS", "WORKSPACE", "TOTAL", 50, "Multi-business-unit rollout"]
    ]
  }
];

const PERMISSIONS = [
  ["workspace.view", "View workspace"],
  ["workspace.manage", "Manage workspace"],
  ["users.manage", "Manage users"],
  ["roles.manage", "Manage roles"],
  ["business-structure.manage", "Manage business structure"],
  ["opportunities.manage", "Manage opportunities"],
  ["scoring.manage", "Manage scoring"],
  ["governance.manage", "Manage governance"],
  ["initiatives.manage", "Manage initiatives"],
  ["analytics.view", "View analytics"],
  ["audit.view", "View audit trail"],
  ["settings.manage", "Manage settings"],
  ["integrations.manage", "Manage integrations"],
  ["billing.manage", "Manage billing"]
];

const ROLE_DEFINITIONS = [
  {
    code: "WORKSPACE_ADMIN",
    name: "Workspace Admin",
    description: "Operational owner of the workspace — manages team, settings and billing.",
    permissionKeys: PERMISSIONS.map(([key]) => key)
  },
  {
    code: "ENTERPRISE_ARCHITECT",
    name: "Enterprise Architect",
    description: "Owns process, application and data mapping — technical authority for the transformation.",
    permissionKeys: [
      "workspace.view",
      "business-structure.manage",
      "opportunities.manage",
      "scoring.manage",
      "governance.manage",
      "analytics.view",
      "audit.view",
      "integrations.manage"
    ]
  },
  {
    code: "TRANSFORMATION_MANAGER",
    name: "Transformation Manager",
    description: "Drives intake, prioritization, governance and value tracking for the AI portfolio.",
    permissionKeys: [
      "workspace.view",
      "business-structure.manage",
      "opportunities.manage",
      "scoring.manage",
      "governance.manage",
      "initiatives.manage",
      "analytics.view"
    ]
  }
];

const USER_DEFINITIONS = [
  {
    email: "admin@movetoai.app",
    name: "Move to AI Admin",
    roleCode: "WORKSPACE_ADMIN",
    isPlatformAdmin: true,
    locale: "EN",
    password: "Admin123!",
    jobTitle: "Platform Administrator",
    userFunction: "transformation_manager",
    preferences: { homePage: "overview", seedAccount: true }
  },
  {
    email: "julien.morel@movetoai.demo",
    name: "Julien Morel",
    roleCode: "WORKSPACE_ADMIN",
    isPlatformAdmin: false,
    locale: "FR",
    jobTitle: "Enterprise Platform Lead",
    userFunction: "transformation_manager",
    preferences: { homePage: "governance", reviewCadence: "monthly" }
  },
  {
    email: "sofia.alvarez@movetoai.demo",
    name: "Sofia Alvarez",
    roleCode: "ENTERPRISE_ARCHITECT",
    isPlatformAdmin: false,
    locale: "ES",
    jobTitle: "Enterprise Architect",
    userFunction: "enterprise_architect",
    preferences: { homePage: "processes", showDataSources: true }
  },
  {
    email: "marcus.reed@movetoai.demo",
    name: "Marcus Reed",
    roleCode: "TRANSFORMATION_MANAGER",
    isPlatformAdmin: false,
    locale: "EN",
    jobTitle: "AI Portfolio Manager",
    userFunction: "transformation_manager",
    preferences: { homePage: "opportunities", favoriteTemplate: "BALANCED_PORTFOLIO" }
  },
  {
    email: "claire.dubois@movetoai.demo",
    name: "Claire Dubois",
    roleCode: "TRANSFORMATION_MANAGER",
    isPlatformAdmin: false,
    locale: "FR",
    jobTitle: "VP Finance Transformation",
    userFunction: "transformation_manager",
    preferences: { businessUnit: "financial-services" }
  },
  {
    email: "emma.collins@movetoai.demo",
    name: "Emma Collins",
    roleCode: "TRANSFORMATION_MANAGER",
    isPlatformAdmin: false,
    locale: "EN",
    jobTitle: "Chief Transformation Officer",
    userFunction: "transformation_manager",
    preferences: { homePage: "governance" }
  },
  {
    email: "diego.herrera@movetoai.demo",
    name: "Diego Herrera",
    roleCode: "TRANSFORMATION_MANAGER",
    isPlatformAdmin: false,
    locale: "EN",
    jobTitle: "AI Transformation Lead",
    userFunction: "transformation_manager",
    preferences: { homePage: "opportunities" }
  },
  {
    email: "liam.chen@movetoai.demo",
    name: "Liam Chen",
    roleCode: "TRANSFORMATION_MANAGER",
    isPlatformAdmin: false,
    locale: "EN",
    jobTitle: "Operations Business Owner",
    userFunction: "transformation_manager",
    preferences: { businessUnit: "operations-retail-manufacturing" }
  }
];

const BUSINESS_UNITS = [
  {
    slug: "financial-services",
    name: "Financial Services",
    code: "FS",
    description: "Insurance, finance, and compliance operations."
  },
  {
    slug: "operations-retail-manufacturing",
    name: "Operations, Retail and Manufacturing",
    code: "ORM",
    description: "Commercial, supply chain, manufacturing, IT, and shared operations."
  }
];

const DOMAINS = [
  ["finance-billing", "Finance and Billing", "financial-services"],
  ["risk-compliance", "Risk and Compliance", "financial-services"],
  ["customer-operations", "Customer Operations", "operations-retail-manufacturing"],
  ["hr-workforce", "HR and Workforce", "operations-retail-manufacturing"],
  ["supply-chain-planning", "Supply Chain and Planning", "operations-retail-manufacturing"],
  ["manufacturing-excellence", "Manufacturing Excellence", "operations-retail-manufacturing"],
  ["it-service-operations", "IT and Service Operations", "operations-retail-manufacturing"],
  ["commercial-merchandising", "Commercial and Merchandising", "operations-retail-manufacturing"]
];

const CAPABILITIES = [
  ["claims-reimbursements", "Claims and Reimbursements", "finance-billing", "financial-services"],
  ["billing-operations", "Billing Operations", "finance-billing", "financial-services"],
  ["accounts-payable", "Accounts Payable", "finance-billing", "financial-services"],
  ["regulatory-intelligence", "Regulatory Intelligence", "risk-compliance", "financial-services"],
  ["contract-governance", "Contract Governance", "risk-compliance", "financial-services"],
  ["due-diligence", "Due Diligence", "risk-compliance", "financial-services"],
  ["contact-center-excellence", "Contact Center Excellence", "customer-operations", "operations-retail-manufacturing"],
  ["customer-communications", "Customer Communications", "customer-operations", "operations-retail-manufacturing"],
  ["case-management", "Case Management", "customer-operations", "operations-retail-manufacturing"],
  ["employee-support", "Employee Support", "hr-workforce", "operations-retail-manufacturing"],
  ["talent-operations", "Talent Operations", "hr-workforce", "operations-retail-manufacturing"],
  ["demand-planning", "Demand Planning", "supply-chain-planning", "operations-retail-manufacturing"],
  ["inventory-optimization", "Inventory Optimization", "supply-chain-planning", "operations-retail-manufacturing"],
  ["procurement-operations", "Procurement Operations", "supply-chain-planning", "operations-retail-manufacturing"],
  ["production-quality", "Production Quality", "manufacturing-excellence", "operations-retail-manufacturing"],
  ["maintenance-reliability", "Maintenance and Reliability", "manufacturing-excellence", "operations-retail-manufacturing"],
  ["it-service-desk", "IT Service Desk", "it-service-operations", "operations-retail-manufacturing"],
  ["knowledge-management", "Knowledge Management", "it-service-operations", "operations-retail-manufacturing"],
  ["merchandising-planning", "Merchandising Planning", "commercial-merchandising", "operations-retail-manufacturing"],
  ["pricing-promotions", "Pricing and Promotions", "commercial-merchandising", "operations-retail-manufacturing"]
];

const APPLICATIONS = [
  ["guidewire-claimcenter", "Guidewire ClaimCenter", "Guidewire"],
  ["sap-s4hana", "SAP S/4HANA", "SAP"],
  ["coupa", "Coupa", "Coupa"],
  ["workday", "Workday", "Workday"],
  ["servicenow", "ServiceNow", "ServiceNow"],
  ["genesys-cloud", "Genesys Cloud", "Genesys"],
  ["salesforce-service-cloud", "Salesforce Service Cloud", "Salesforce"],
  ["microsoft-365", "Microsoft 365", "Microsoft"],
  ["sharepoint-online", "SharePoint Online", "Microsoft"],
  ["snowflake", "Snowflake", "Snowflake"],
  ["databricks", "Databricks", "Databricks"],
  ["zendesk", "Zendesk", "Zendesk"]
];

const DATA_SOURCES = [
  ["claims-document-repository", "Claims document repository"],
  ["policy-master-data", "Policy master data"],
  ["invoice-inbox", "Invoice inbox"],
  ["erp-finance-ledger", "ERP finance ledger"],
  ["contract-repository", "Contract repository"],
  ["regulatory-bulletins", "Regulatory bulletins"],
  ["customer-email-inbox", "Customer email inbox"],
  ["contact-center-transcripts", "Contact center transcripts"],
  ["crm-interaction-history", "CRM interaction history"],
  ["workforce-case-history", "Workforce case history"],
  ["demand-sales-history", "Demand and sales history"],
  ["supplier-master-data", "Supplier master data"],
  ["machine-telemetry", "Machine telemetry"],
  ["qa-image-library", "QA image library"],
  ["itsm-ticket-history", "ITSM ticket history"],
  ["knowledge-base-content", "Knowledge base content"]
];

const KPI_DEFINITIONS = [
  {
    slug: "claims-cycle-time",
    name: "Claims cycle time",
    metricType: "TIME",
    unit: "days",
    processSlug: "claims-adjudication"
  },
  {
    slug: "claims-leakage-rate",
    name: "Claims leakage rate",
    metricType: "RISK",
    unit: "%",
    processSlug: "claims-adjudication"
  },
  {
    slug: "invoice-exception-rate",
    name: "Invoice exception rate",
    metricType: "QUALITY",
    unit: "%",
    processSlug: "invoice-capture-validation"
  },
  {
    slug: "ap-touchless-rate",
    name: "AP touchless rate",
    metricType: "EFFICIENCY",
    unit: "%",
    processSlug: "accounts-payable-matching"
  },
  {
    slug: "revenue-loss-prevented",
    name: "Revenue loss prevented",
    metricType: "FINANCIAL",
    unit: "USD",
    processSlug: "revenue-assurance-review"
  },
  {
    slug: "regulatory-review-time",
    name: "Regulatory review time",
    metricType: "TIME",
    unit: "hours",
    processSlug: "regulatory-horizon-scanning"
  },
  {
    slug: "first-contact-resolution",
    name: "First contact resolution",
    metricType: "QUALITY",
    unit: "%",
    processSlug: "contact-center-case-resolution"
  },
  {
    slug: "hr-case-sla",
    name: "HR case SLA",
    metricType: "TIME",
    unit: "hours",
    processSlug: "hr-service-desk"
  },
  {
    slug: "forecast-accuracy",
    name: "Forecast accuracy",
    metricType: "QUALITY",
    unit: "%",
    processSlug: "demand-forecasting"
  },
  {
    slug: "stockout-rate",
    name: "Stockout rate",
    metricType: "RISK",
    unit: "%",
    processSlug: "replenishment-planning"
  },
  {
    slug: "defect-escape-rate",
    name: "Defect escape rate",
    metricType: "QUALITY",
    unit: "%",
    processSlug: "visual-quality-inspection-review"
  },
  {
    slug: "mean-time-to-resolution",
    name: "Mean time to resolution",
    metricType: "TIME",
    unit: "hours",
    processSlug: "it-ticket-triage"
  }
];

const TAGS = [
  ["quick-win", "Quick win", "#2563EB"],
  ["board-priority", "Board priority", "#1E3A8A"],
  ["foundation-first", "Foundation first", "#D97706"],
  ["high-risk", "High risk", "#DC2626"],
  ["finance", "Finance", "#0F172A"],
  ["retail", "Retail", "#16A34A"],
  ["manufacturing", "Manufacturing", "#0891B2"],
  ["compliance-heavy", "Compliance heavy", "#7C3AED"],
  ["customer-facing", "Customer facing", "#F59E0B"],
  ["data-ready", "Data ready", "#16A34A"]
];

const OPPORTUNITY_TYPES = [
  ["WORKFLOW_AUTOMATION", "Workflow automation"],
  ["DOCUMENT_INTELLIGENCE", "Document intelligence"],
  ["EXTRACTION_AUTOMATION", "Extraction automation"],
  ["COPILOT", "Copilot"],
  ["CLASSIFICATION_ROUTING", "Classification and routing"],
  ["ANOMALY_DETECTION", "Anomaly detection"],
  ["FORECASTING_OPTIMIZATION", "Forecasting and optimization"],
  ["KNOWLEDGE_SEARCH", "Knowledge search"]
];

const SCORE_TEMPLATES = [
  {
    code: "QUICK_WIN_FILTER",
    name: "Quick win filter",
    description: "Fast filter for freemium and early-stage opportunity triage.",
    isDefault: false,
    dimensions: [
      ["VALUE_POTENTIAL", "Value potential", "FINANCIAL", 35],
      ["FEASIBILITY", "Feasibility", "EFFICIENCY", 30],
      ["TIME_TO_VALUE", "Time to value", "TIME", 20],
      ["DATA_READINESS", "Data readiness", "QUALITY", 15]
    ]
  },
  {
    code: "BALANCED_PORTFOLIO",
    name: "Balanced portfolio",
    description: "Core template balancing value, feasibility, adoption, and risk.",
    isDefault: true,
    dimensions: [
      ["VALUE_POTENTIAL", "Value potential", "FINANCIAL", 30],
      ["FEASIBILITY", "Feasibility", "EFFICIENCY", 20],
      ["ADOPTION_READINESS", "Adoption readiness", "ADOPTION", 15],
      ["RISK_CONTROL", "Risk control", "RISK", 15],
      ["DATA_READINESS", "Data readiness", "QUALITY", 10],
      ["STRATEGIC_ALIGNMENT", "Strategic alignment", "CUSTOMER", 10]
    ]
  },
  {
    code: "ENTERPRISE_GOVERNANCE",
    name: "Enterprise governance lens",
    description: "Weighted template for complex opportunities needing stronger controls.",
    isDefault: false,
    dimensions: [
      ["VALUE_POTENTIAL", "Value potential", "FINANCIAL", 20],
      ["STRATEGIC_ALIGNMENT", "Strategic alignment", "CUSTOMER", 20],
      ["COMPLIANCE_FIT", "Compliance fit", "RISK", 20],
      ["INTEGRATION_READINESS", "Integration readiness", "EFFICIENCY", 15],
      ["CHANGE_READINESS", "Change readiness", "ADOPTION", 10],
      ["DATA_READINESS", "Data readiness", "QUALITY", 15]
    ]
  }
];

const APPLICATION_DATA_MAP = {
  "guidewire-claimcenter": ["claims-document-repository", "policy-master-data"],
  "sap-s4hana": ["erp-finance-ledger", "demand-sales-history", "supplier-master-data"],
  coupa: ["supplier-master-data", "erp-finance-ledger"],
  workday: ["workforce-case-history", "knowledge-base-content"],
  servicenow: ["itsm-ticket-history", "knowledge-base-content", "machine-telemetry"],
  "genesys-cloud": ["contact-center-transcripts", "crm-interaction-history"],
  "salesforce-service-cloud": ["crm-interaction-history", "customer-email-inbox"],
  "microsoft-365": ["customer-email-inbox", "contract-repository", "regulatory-bulletins"],
  "sharepoint-online": ["contract-repository", "regulatory-bulletins", "knowledge-base-content", "qa-image-library"],
  snowflake: ["demand-sales-history", "erp-finance-ledger", "claims-document-repository", "machine-telemetry"],
  databricks: ["machine-telemetry", "qa-image-library", "demand-sales-history"],
  zendesk: ["customer-email-inbox", "workforce-case-history"]
};

const PROCESS_DEFINITIONS = [
  proc({
    slug: "claims-intake-triage",
    name: "Claims intake and triage",
    domainSlug: "finance-billing",
    capabilitySlug: "claims-reimbursements",
    businessUnitSlug: "financial-services",
    sector: "finance",
    applications: ["guidewire-claimcenter", "microsoft-365"],
    dataSources: ["claims-document-repository", "policy-master-data"],
    kpis: ["claims-cycle-time", "claims-leakage-rate"],
    painPointTitle: "Claim submissions arrive in inconsistent formats",
    painPointDescription: "First-line teams spend too much time normalizing intake before any value-added review starts.",
    painPointSeverity: "HIGH",
    subProcesses: [
      ["claim-document-triage", "Claim document triage"],
      ["reserve-recommendation-review", "Reserve recommendation review"]
    ]
  }),
  proc({
    slug: "claims-adjudication",
    name: "Claims adjudication",
    domainSlug: "finance-billing",
    capabilitySlug: "claims-reimbursements",
    businessUnitSlug: "financial-services",
    sector: "finance",
    applications: ["guidewire-claimcenter", "snowflake"],
    dataSources: ["claims-document-repository", "policy-master-data"],
    kpis: ["claims-cycle-time", "claims-leakage-rate"],
    painPointTitle: "Low-complexity claims still require manual touch",
    painPointDescription: "Adjusters are overloaded with repetitive adjudication steps that should be partially automated.",
    painPointSeverity: "HIGH",
    subProcesses: [["fraud-escalation-review", "Fraud escalation review"]]
  }),
  proc({
    slug: "invoice-capture-validation",
    name: "Invoice capture and validation",
    domainSlug: "finance-billing",
    capabilitySlug: "billing-operations",
    businessUnitSlug: "financial-services",
    sector: "finance",
    applications: ["sap-s4hana", "microsoft-365"],
    dataSources: ["invoice-inbox", "erp-finance-ledger"],
    kpis: ["invoice-exception-rate"],
    painPointTitle: "Invoice intake depends on manual extraction and validation",
    painPointDescription: "Teams rekey fields and reconcile invoice images by hand, driving exception rates upward.",
    painPointSeverity: "HIGH",
    subProcesses: [["invoice-line-item-validation", "Invoice line item validation"]]
  }),
  proc({
    slug: "accounts-payable-matching",
    name: "Accounts payable matching",
    domainSlug: "finance-billing",
    capabilitySlug: "accounts-payable",
    businessUnitSlug: "financial-services",
    sector: "finance",
    applications: ["sap-s4hana", "coupa"],
    dataSources: ["erp-finance-ledger", "supplier-master-data"],
    kpis: ["ap-touchless-rate"],
    painPointTitle: "Mismatch cases stall AP teams for simple reasons",
    painPointDescription: "Three-way match exceptions take too long to triage and prolong payment cycles.",
    painPointSeverity: "MEDIUM",
    subProcesses: [["match-exception-review", "Match exception review"]]
  }),
  proc({
    slug: "billing-exception-management",
    name: "Billing exception management",
    domainSlug: "finance-billing",
    capabilitySlug: "billing-operations",
    businessUnitSlug: "financial-services",
    sector: "finance",
    applications: ["sap-s4hana", "salesforce-service-cloud"],
    dataSources: ["erp-finance-ledger", "crm-interaction-history"],
    kpis: ["revenue-loss-prevented"],
    painPointTitle: "Revenue leakage signals are buried in exception queues",
    painPointDescription: "Billing teams react too late because anomalies are spread across tickets, notes, and ledger records.",
    painPointSeverity: "HIGH"
  }),
  proc({
    slug: "revenue-assurance-review",
    name: "Revenue assurance review",
    domainSlug: "finance-billing",
    capabilitySlug: "billing-operations",
    businessUnitSlug: "financial-services",
    sector: "finance",
    applications: ["sap-s4hana", "snowflake"],
    dataSources: ["erp-finance-ledger", "crm-interaction-history"],
    kpis: ["revenue-loss-prevented"],
    painPointTitle: "Revenue review relies on static samples instead of live signals",
    painPointDescription: "Analysts miss subtle patterns because reviews happen too late and with incomplete context.",
    painPointSeverity: "MEDIUM"
  }),
  proc({
    slug: "regulatory-horizon-scanning",
    name: "Regulatory horizon scanning",
    domainSlug: "risk-compliance",
    capabilitySlug: "regulatory-intelligence",
    businessUnitSlug: "financial-services",
    sector: "finance",
    applications: ["sharepoint-online", "microsoft-365"],
    dataSources: ["regulatory-bulletins", "knowledge-base-content"],
    kpis: ["regulatory-review-time"],
    painPointTitle: "Regulatory updates are reviewed too manually",
    painPointDescription: "Teams lose days scanning new bulletins and linking them to existing obligations.",
    painPointSeverity: "HIGH",
    subProcesses: [["regulatory-obligation-mapping", "Regulatory obligation mapping"]]
  }),
  proc({
    slug: "policy-procedure-review",
    name: "Policy and procedure review",
    domainSlug: "risk-compliance",
    capabilitySlug: "regulatory-intelligence",
    businessUnitSlug: "financial-services",
    sector: "finance",
    applications: ["sharepoint-online", "microsoft-365"],
    dataSources: ["regulatory-bulletins", "knowledge-base-content"],
    kpis: ["regulatory-review-time"],
    painPointTitle: "Internal policies lag behind external requirements",
    painPointDescription: "Policy owners struggle to summarize changes and identify the procedures most affected.",
    painPointSeverity: "MEDIUM",
    subProcesses: [["policy-change-diff", "Policy change diff"]]
  }),
  proc({
    slug: "contract-review-obligation-tracking",
    name: "Contract review and obligation tracking",
    domainSlug: "risk-compliance",
    capabilitySlug: "contract-governance",
    businessUnitSlug: "financial-services",
    sector: "finance",
    applications: ["sharepoint-online", "microsoft-365"],
    dataSources: ["contract-repository", "knowledge-base-content"],
    kpis: ["regulatory-review-time"],
    painPointTitle: "Commercial and supplier contracts hide manual review work",
    painPointDescription: "Legal and sourcing teams spend too long extracting clauses, obligations, and renewal triggers.",
    painPointSeverity: "HIGH",
    subProcesses: [["clause-risk-highlighting", "Clause risk highlighting"]]
  }),
  proc({
    slug: "kyc-due-diligence-case-review",
    name: "KYC and due diligence case review",
    domainSlug: "risk-compliance",
    capabilitySlug: "due-diligence",
    businessUnitSlug: "financial-services",
    sector: "finance",
    applications: ["salesforce-service-cloud", "sharepoint-online"],
    dataSources: ["regulatory-bulletins", "crm-interaction-history"],
    kpis: ["regulatory-review-time"],
    painPointTitle: "Reviewers cannot separate straightforward cases from risky ones quickly enough",
    painPointDescription: "High-value analysts are occupied by repetitive screening tasks instead of true escalations.",
    painPointSeverity: "HIGH"
  }),
  proc({
    slug: "inbound-email-routing",
    name: "Inbound email routing",
    domainSlug: "customer-operations",
    capabilitySlug: "customer-communications",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "retail",
    applications: ["salesforce-service-cloud", "microsoft-365"],
    dataSources: ["customer-email-inbox", "crm-interaction-history"],
    kpis: ["first-contact-resolution"],
    painPointTitle: "Shared inboxes delay customer response and routing",
    painPointDescription: "Teams rely on manual triage to classify incoming messages and assign them to the right queue.",
    painPointSeverity: "HIGH",
    subProcesses: [["email-intent-detection", "Email intent detection"]]
  }),
  proc({
    slug: "contact-center-case-resolution",
    name: "Contact center case resolution",
    domainSlug: "customer-operations",
    capabilitySlug: "contact-center-excellence",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "retail",
    applications: ["genesys-cloud", "salesforce-service-cloud"],
    dataSources: ["contact-center-transcripts", "crm-interaction-history"],
    kpis: ["first-contact-resolution"],
    painPointTitle: "Agents lack the right context during live conversations",
    painPointDescription: "Resolution quality varies by agent because knowledge and next-best actions are not surfaced in real time.",
    painPointSeverity: "HIGH",
    subProcesses: [["callback-priority-routing", "Callback priority routing"]]
  }),
  proc({
    slug: "complaint-handling",
    name: "Complaint handling",
    domainSlug: "customer-operations",
    capabilitySlug: "case-management",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "retail",
    applications: ["salesforce-service-cloud", "zendesk"],
    dataSources: ["customer-email-inbox", "crm-interaction-history"],
    kpis: ["first-contact-resolution"],
    painPointTitle: "Complaint themes are identified too late",
    painPointDescription: "Teams do not see repeat root causes soon enough to adjust product, policy, or service actions.",
    painPointSeverity: "MEDIUM"
  }),
  proc({
    slug: "customer-onboarding-verification",
    name: "Customer onboarding verification",
    domainSlug: "customer-operations",
    capabilitySlug: "case-management",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "retail",
    applications: ["salesforce-service-cloud", "sharepoint-online"],
    dataSources: ["crm-interaction-history", "contract-repository"],
    kpis: ["first-contact-resolution"],
    painPointTitle: "Verification teams re-check many of the same onboarding documents",
    painPointDescription: "Manual document review slows activation and increases false-positive escalations.",
    painPointSeverity: "MEDIUM"
  }),
  proc({
    slug: "returns-refund-resolution",
    name: "Returns and refund resolution",
    domainSlug: "customer-operations",
    capabilitySlug: "case-management",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "retail",
    applications: ["zendesk", "sap-s4hana"],
    dataSources: ["crm-interaction-history", "erp-finance-ledger"],
    kpis: ["first-contact-resolution"],
    painPointTitle: "Refund cases contain too many repetitive investigations",
    painPointDescription: "Agents collect order, payment, and policy details manually before acting on simple refund requests.",
    painPointSeverity: "MEDIUM"
  }),
  proc({
    slug: "hr-service-desk",
    name: "HR service desk",
    domainSlug: "hr-workforce",
    capabilitySlug: "employee-support",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "shared",
    applications: ["workday", "zendesk"],
    dataSources: ["workforce-case-history", "knowledge-base-content"],
    kpis: ["hr-case-sla"],
    painPointTitle: "HR teams answer the same policy questions every week",
    painPointDescription: "Employees wait too long for basic answers because knowledge is fragmented across portals and documents.",
    painPointSeverity: "MEDIUM",
    subProcesses: [["new-hire-q-and-a", "New hire Q and A"]]
  }),
  proc({
    slug: "employee-onboarding-coordination",
    name: "Employee onboarding coordination",
    domainSlug: "hr-workforce",
    capabilitySlug: "employee-support",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "shared",
    applications: ["workday", "servicenow"],
    dataSources: ["workforce-case-history", "knowledge-base-content"],
    kpis: ["hr-case-sla"],
    painPointTitle: "Cross-functional onboarding tasks slip between teams",
    painPointDescription: "Managers, IT, and HR rely on emails and spreadsheets to coordinate new joiner tasks.",
    painPointSeverity: "MEDIUM"
  }),
  proc({
    slug: "talent-screening-shortlisting",
    name: "Talent screening and shortlisting",
    domainSlug: "hr-workforce",
    capabilitySlug: "talent-operations",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "shared",
    applications: ["workday", "microsoft-365"],
    dataSources: ["workforce-case-history", "knowledge-base-content"],
    kpis: ["hr-case-sla"],
    painPointTitle: "Recruiters lose time summarizing and comparing profiles",
    painPointDescription: "Resume reviews are inconsistent and hard to defend when volume spikes.",
    painPointSeverity: "HIGH"
  }),
  proc({
    slug: "demand-forecasting",
    name: "Demand forecasting",
    domainSlug: "supply-chain-planning",
    capabilitySlug: "demand-planning",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "retail",
    applications: ["sap-s4hana", "snowflake"],
    dataSources: ["demand-sales-history", "supplier-master-data"],
    kpis: ["forecast-accuracy"],
    painPointTitle: "Demand plans miss localized demand shifts",
    painPointDescription: "Analysts cannot incorporate promotions, weather, and operational signals fast enough.",
    painPointSeverity: "HIGH",
    subProcesses: [["promotional-lift-modeling", "Promotional lift modeling"]]
  }),
  proc({
    slug: "replenishment-planning",
    name: "Replenishment planning",
    domainSlug: "supply-chain-planning",
    capabilitySlug: "inventory-optimization",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "retail",
    applications: ["sap-s4hana", "snowflake"],
    dataSources: ["demand-sales-history", "supplier-master-data"],
    kpis: ["stockout-rate"],
    painPointTitle: "Planners react to stock risk too late",
    painPointDescription: "Replenishment exceptions are reviewed manually and lack a clear prioritization signal.",
    painPointSeverity: "HIGH"
  }),
  proc({
    slug: "supplier-risk-monitoring",
    name: "Supplier risk monitoring",
    domainSlug: "supply-chain-planning",
    capabilitySlug: "procurement-operations",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "manufacturing",
    applications: ["coupa", "sap-s4hana"],
    dataSources: ["supplier-master-data", "regulatory-bulletins"],
    kpis: ["stockout-rate"],
    painPointTitle: "Supplier issues are spotted only after procurement teams are already impacted",
    painPointDescription: "Signals from news, contracts, and performance data are not synthesized into a usable early warning.",
    painPointSeverity: "HIGH",
    subProcesses: [["supplier-news-monitoring", "Supplier news monitoring"]]
  }),
  proc({
    slug: "purchase-requisition-processing",
    name: "Purchase requisition processing",
    domainSlug: "supply-chain-planning",
    capabilitySlug: "procurement-operations",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "manufacturing",
    applications: ["coupa", "sap-s4hana"],
    dataSources: ["supplier-master-data", "erp-finance-ledger"],
    kpis: ["ap-touchless-rate"],
    painPointTitle: "Requisition intake spends too much time on categorization and routing",
    painPointDescription: "Low-value requests still require manual review before the right approver sees them.",
    painPointSeverity: "MEDIUM"
  }),
  proc({
    slug: "production-incident-triage",
    name: "Production incident triage",
    domainSlug: "manufacturing-excellence",
    capabilitySlug: "production-quality",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "manufacturing",
    applications: ["servicenow", "databricks"],
    dataSources: ["machine-telemetry", "qa-image-library"],
    kpis: ["defect-escape-rate"],
    painPointTitle: "Shift teams lose time diagnosing incidents with incomplete context",
    painPointDescription: "Production incidents are escalated with sparse notes and no unified summary of recent events.",
    painPointSeverity: "HIGH"
  }),
  proc({
    slug: "visual-quality-inspection-review",
    name: "Visual quality inspection review",
    domainSlug: "manufacturing-excellence",
    capabilitySlug: "production-quality",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "manufacturing",
    applications: ["databricks", "sharepoint-online"],
    dataSources: ["qa-image-library", "machine-telemetry"],
    kpis: ["defect-escape-rate"],
    painPointTitle: "Quality reviewers sort thousands of images manually",
    painPointDescription: "Defect verification becomes a bottleneck because image triage is inconsistent across shifts.",
    painPointSeverity: "HIGH",
    subProcesses: [["defect-image-triage", "Defect image triage"]]
  }),
  proc({
    slug: "preventive-maintenance-planning",
    name: "Preventive maintenance planning",
    domainSlug: "manufacturing-excellence",
    capabilitySlug: "maintenance-reliability",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "manufacturing",
    applications: ["servicenow", "databricks"],
    dataSources: ["machine-telemetry", "knowledge-base-content"],
    kpis: ["mean-time-to-resolution"],
    painPointTitle: "Maintenance planning is reactive instead of predictive",
    painPointDescription: "Teams see too many alerts and struggle to prioritize assets that will actually fail soon.",
    painPointSeverity: "HIGH"
  }),
  proc({
    slug: "shop-floor-knowledge-retrieval",
    name: "Shop floor knowledge retrieval",
    domainSlug: "manufacturing-excellence",
    capabilitySlug: "maintenance-reliability",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "manufacturing",
    applications: ["sharepoint-online", "microsoft-365"],
    dataSources: ["knowledge-base-content", "machine-telemetry"],
    kpis: ["mean-time-to-resolution"],
    painPointTitle: "Operators cannot find the right instructions fast enough",
    painPointDescription: "Critical procedures and tribal knowledge remain scattered across manuals and folders.",
    painPointSeverity: "MEDIUM"
  }),
  proc({
    slug: "it-ticket-triage",
    name: "IT ticket triage",
    domainSlug: "it-service-operations",
    capabilitySlug: "it-service-desk",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "shared",
    applications: ["servicenow", "microsoft-365"],
    dataSources: ["itsm-ticket-history", "knowledge-base-content"],
    kpis: ["mean-time-to-resolution"],
    painPointTitle: "Service desk queues depend on manual priority decisions",
    painPointDescription: "Analysts lose time reading repetitive tickets before routing or prioritizing them.",
    painPointSeverity: "HIGH",
    subProcesses: [["itsm-priority-scorer", "ITSM priority scorer"]]
  }),
  proc({
    slug: "change-request-review",
    name: "Change request review",
    domainSlug: "it-service-operations",
    capabilitySlug: "it-service-desk",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "shared",
    applications: ["servicenow", "sharepoint-online"],
    dataSources: ["itsm-ticket-history", "knowledge-base-content"],
    kpis: ["mean-time-to-resolution"],
    painPointTitle: "CAB reviews are slowed by manual impact analysis",
    painPointDescription: "Change managers need help summarizing risk, dependencies, and freeze-window exposure.",
    painPointSeverity: "HIGH"
  }),
  proc({
    slug: "knowledge-article-search",
    name: "Knowledge article search",
    domainSlug: "it-service-operations",
    capabilitySlug: "knowledge-management",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "shared",
    applications: ["servicenow", "sharepoint-online"],
    dataSources: ["knowledge-base-content", "itsm-ticket-history"],
    kpis: ["mean-time-to-resolution"],
    painPointTitle: "Support teams do not trust internal search",
    painPointDescription: "Relevant runbooks and articles are hard to find, so analysts recreate answers from scratch.",
    painPointSeverity: "MEDIUM"
  }),
  proc({
    slug: "assortment-pricing-review",
    name: "Assortment and pricing review",
    domainSlug: "commercial-merchandising",
    capabilitySlug: "pricing-promotions",
    businessUnitSlug: "operations-retail-manufacturing",
    sector: "retail",
    applications: ["sap-s4hana", "snowflake"],
    dataSources: ["demand-sales-history", "erp-finance-ledger"],
    kpis: ["forecast-accuracy"],
    painPointTitle: "Pricing and assortment reviews still depend on spreadsheets",
    painPointDescription: "Merchandising teams cannot isolate meaningful anomalies or markdown opportunities quickly enough.",
    painPointSeverity: "MEDIUM"
  })
];

const OPPORTUNITIES = [
  opp("automated-claims-handling", "Automated claims handling", "claims-adjudication", {
    typeCode: "WORKFLOW_AUTOMATION",
    status: "LIVE",
    badge: "TRANSFORMATIONAL",
    dataReadiness: "HIGH",
    riskSeverity: "MEDIUM",
    expectedValue: 1850000,
    realizedValue: 620000,
    baseScore: 88,
    tagSlugs: ["board-priority", "customer-facing", "data-ready"],
    initiativeSlug: "claims-automation-wave-1"
  }),
  opp("claims-intake-document-triage", "Claims intake document triage", "claims-intake-triage", {
    typeCode: "DOCUMENT_INTELLIGENCE",
    status: "IN_PROGRESS",
    badge: "HIGH_CONFIDENCE",
    dataReadiness: "HIGH",
    riskSeverity: "MEDIUM",
    expectedValue: 540000,
    baseScore: 82,
    subProcessSlug: "claim-document-triage",
    tagSlugs: ["finance", "data-ready"]
  }),
  opp("invoice-data-extraction", "Invoice data extraction", "invoice-capture-validation", {
    typeCode: "EXTRACTION_AUTOMATION",
    status: "LIVE",
    badge: "QUICK_WIN",
    dataReadiness: "PRODUCTION_READY",
    riskSeverity: "LOW",
    expectedValue: 760000,
    realizedValue: 285000,
    baseScore: 90,
    subProcessSlug: "invoice-line-item-validation",
    tagSlugs: ["quick-win", "finance", "data-ready"],
    initiativeSlug: "invoice-intake-automation-rollout"
  }),
  opp("ap-match-exception-copilot", "AP match exception copilot", "accounts-payable-matching", {
    typeCode: "COPILOT",
    status: "PRIORITIZED",
    badge: "HIGH_CONFIDENCE",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 460000,
    baseScore: 77,
    subProcessSlug: "match-exception-review",
    tagSlugs: ["finance"]
  }),
  opp("billing-anomaly-detection", "Billing anomaly detection", "billing-exception-management", {
    typeCode: "ANOMALY_DETECTION",
    status: "APPROVED",
    badge: "STRATEGIC",
    dataReadiness: "HIGH",
    riskSeverity: "MEDIUM",
    expectedValue: 1120000,
    baseScore: 84,
    tagSlugs: ["board-priority", "finance"]
  }),
  opp("revenue-leakage-investigator", "Revenue leakage investigator", "revenue-assurance-review", {
    typeCode: "ANOMALY_DETECTION",
    status: "ASSESSING",
    badge: "STRATEGIC",
    dataReadiness: "MEDIUM",
    riskSeverity: "HIGH",
    expectedValue: 980000,
    baseScore: 73,
    tagSlugs: ["finance", "high-risk"]
  }),
  opp("regulatory-document-search", "Regulatory document search", "regulatory-horizon-scanning", {
    typeCode: "KNOWLEDGE_SEARCH",
    status: "APPROVED",
    badge: "HIGH_CONFIDENCE",
    dataReadiness: "HIGH",
    riskSeverity: "MEDIUM",
    expectedValue: 390000,
    baseScore: 81,
    tagSlugs: ["compliance-heavy", "finance"],
    initiativeSlug: "regulatory-search-program"
  }),
  opp("policy-change-impact-summarization", "Policy change impact summarization", "policy-procedure-review", {
    typeCode: "DOCUMENT_INTELLIGENCE",
    status: "IDENTIFIED",
    badge: "STRATEGIC",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 210000,
    baseScore: 66,
    subProcessSlug: "policy-change-diff",
    tagSlugs: ["compliance-heavy"]
  }),
  opp("contract-summarization", "Contract summarization", "contract-review-obligation-tracking", {
    typeCode: "DOCUMENT_INTELLIGENCE",
    status: "APPROVED",
    badge: "STRATEGIC",
    dataReadiness: "HIGH",
    riskSeverity: "MEDIUM",
    expectedValue: 580000,
    baseScore: 80,
    subProcessSlug: "clause-risk-highlighting",
    tagSlugs: ["board-priority", "compliance-heavy"],
    initiativeSlug: "contract-intelligence-program"
  }),
  opp("kyc-case-prioritization", "KYC case prioritization", "kyc-due-diligence-case-review", {
    typeCode: "CLASSIFICATION_ROUTING",
    status: "PRIORITIZED",
    badge: "STRATEGIC",
    dataReadiness: "MEDIUM",
    riskSeverity: "HIGH",
    expectedValue: 430000,
    baseScore: 72,
    tagSlugs: ["finance", "compliance-heavy", "high-risk"]
  }),
  opp("incoming-email-classification", "Incoming email classification", "inbound-email-routing", {
    typeCode: "CLASSIFICATION_ROUTING",
    status: "APPROVED",
    badge: "QUICK_WIN",
    dataReadiness: "HIGH",
    riskSeverity: "LOW",
    expectedValue: 320000,
    baseScore: 85,
    subProcessSlug: "email-intent-detection",
    tagSlugs: ["quick-win", "customer-facing", "retail"],
    initiativeSlug: "portfolio-email-routing-foundation"
  }),
  opp("contact-center-agent-assistant", "Contact center agent assistant", "contact-center-case-resolution", {
    typeCode: "COPILOT",
    status: "IN_PROGRESS",
    badge: "TRANSFORMATIONAL",
    dataReadiness: "HIGH",
    riskSeverity: "MEDIUM",
    expectedValue: 1340000,
    baseScore: 84,
    tagSlugs: ["board-priority", "customer-facing", "retail"],
    initiativeSlug: "contact-center-assist-rollout"
  }),
  opp("complaint-root-cause-clustering", "Complaint root cause clustering", "complaint-handling", {
    typeCode: "ANOMALY_DETECTION",
    status: "ASSESSING",
    badge: "STRATEGIC",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 260000,
    baseScore: 71,
    tagSlugs: ["retail", "customer-facing"]
  }),
  opp("onboarding-verification-copilot", "Onboarding verification copilot", "customer-onboarding-verification", {
    typeCode: "COPILOT",
    status: "PRIORITIZED",
    badge: "HIGH_CONFIDENCE",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 355000,
    baseScore: 76,
    tagSlugs: ["retail"]
  }),
  opp("returns-refund-fraud-screening", "Returns and refund fraud screening", "returns-refund-resolution", {
    typeCode: "ANOMALY_DETECTION",
    status: "IDENTIFIED",
    badge: "AT_RISK",
    dataReadiness: "LOW",
    riskSeverity: "HIGH",
    expectedValue: 470000,
    baseScore: 61,
    tagSlugs: ["retail", "high-risk"]
  }),
  opp("hr-support-copilot", "HR support copilot", "hr-service-desk", {
    typeCode: "COPILOT",
    status: "LIVE",
    badge: "QUICK_WIN",
    dataReadiness: "HIGH",
    riskSeverity: "LOW",
    expectedValue: 280000,
    realizedValue: 118000,
    baseScore: 89,
    subProcessSlug: "new-hire-q-and-a",
    tagSlugs: ["quick-win", "data-ready"],
    initiativeSlug: "hr-service-copilot-rollout"
  }),
  opp("onboarding-task-orchestration", "Onboarding task orchestration", "employee-onboarding-coordination", {
    typeCode: "WORKFLOW_AUTOMATION",
    status: "IN_PROGRESS",
    badge: "HIGH_CONFIDENCE",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 240000,
    baseScore: 78
  }),
  opp("talent-screening-shortlist-assistant", "Talent screening shortlist assistant", "talent-screening-shortlisting", {
    typeCode: "COPILOT",
    status: "ASSESSING",
    badge: "AT_RISK",
    dataReadiness: "LOW",
    riskSeverity: "CRITICAL",
    expectedValue: 310000,
    baseScore: 58,
    tagSlugs: ["high-risk", "compliance-heavy"]
  }),
  opp("demand-forecasting", "Demand forecasting", "demand-forecasting", {
    typeCode: "FORECASTING_OPTIMIZATION",
    status: "LIVE",
    badge: "TRANSFORMATIONAL",
    dataReadiness: "HIGH",
    riskSeverity: "MEDIUM",
    expectedValue: 2140000,
    realizedValue: 710000,
    baseScore: 91,
    subProcessSlug: "promotional-lift-modeling",
    tagSlugs: ["board-priority", "retail", "data-ready"],
    initiativeSlug: "demand-sensing-pilot"
  }),
  opp("replenishment-exception-recommendations", "Replenishment exception recommendations", "replenishment-planning", {
    typeCode: "FORECASTING_OPTIMIZATION",
    status: "APPROVED",
    badge: "STRATEGIC",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 690000,
    baseScore: 80,
    tagSlugs: ["retail"]
  }),
  opp("supplier-risk-signal-monitoring", "Supplier risk signal monitoring", "supplier-risk-monitoring", {
    typeCode: "ANOMALY_DETECTION",
    status: "PRIORITIZED",
    badge: "STRATEGIC",
    dataReadiness: "MEDIUM",
    riskSeverity: "HIGH",
    expectedValue: 740000,
    baseScore: 74,
    subProcessSlug: "supplier-news-monitoring",
    tagSlugs: ["manufacturing", "high-risk", "compliance-heavy"]
  }),
  opp("purchase-requisition-intake-assistant", "Purchase requisition intake assistant", "purchase-requisition-processing", {
    typeCode: "CLASSIFICATION_ROUTING",
    status: "IDENTIFIED",
    badge: "QUICK_WIN",
    dataReadiness: "MEDIUM",
    riskSeverity: "LOW",
    expectedValue: 190000,
    baseScore: 72,
    tagSlugs: ["manufacturing", "quick-win"]
  }),
  opp("production-incident-triage", "Production incident triage", "production-incident-triage", {
    typeCode: "COPILOT",
    status: "APPROVED",
    badge: "STRATEGIC",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 520000,
    baseScore: 79,
    tagSlugs: ["manufacturing"]
  }),
  opp("visual-defect-review-assistant", "Visual defect review assistant", "visual-quality-inspection-review", {
    typeCode: "DOCUMENT_INTELLIGENCE",
    status: "IN_PROGRESS",
    badge: "HIGH_CONFIDENCE",
    dataReadiness: "HIGH",
    riskSeverity: "MEDIUM",
    expectedValue: 610000,
    baseScore: 83,
    subProcessSlug: "defect-image-triage",
    tagSlugs: ["manufacturing", "data-ready"]
  }),
  opp("predictive-maintenance-recommendations", "Predictive maintenance recommendations", "preventive-maintenance-planning", {
    typeCode: "FORECASTING_OPTIMIZATION",
    status: "PRIORITIZED",
    badge: "TRANSFORMATIONAL",
    dataReadiness: "MEDIUM",
    riskSeverity: "HIGH",
    expectedValue: 960000,
    baseScore: 76,
    tagSlugs: ["manufacturing", "high-risk"],
    initiativeSlug: "maintenance-recommendation-pilot"
  }),
  opp("shop-floor-knowledge-search", "Shop floor knowledge search", "shop-floor-knowledge-retrieval", {
    typeCode: "KNOWLEDGE_SEARCH",
    status: "APPROVED",
    badge: "HIGH_CONFIDENCE",
    dataReadiness: "MEDIUM",
    riskSeverity: "LOW",
    expectedValue: 230000,
    baseScore: 80,
    tagSlugs: ["manufacturing"]
  }),
  opp("it-ticket-prioritization", "IT ticket prioritization", "it-ticket-triage", {
    typeCode: "CLASSIFICATION_ROUTING",
    status: "LIVE",
    badge: "QUICK_WIN",
    dataReadiness: "PRODUCTION_READY",
    riskSeverity: "LOW",
    expectedValue: 410000,
    realizedValue: 162000,
    baseScore: 90,
    subProcessSlug: "itsm-priority-scorer",
    tagSlugs: ["quick-win", "data-ready"],
    initiativeSlug: "itsm-triage-autopilot"
  }),
  opp("change-request-risk-summarization", "Change request risk summarization", "change-request-review", {
    typeCode: "DOCUMENT_INTELLIGENCE",
    status: "ASSESSING",
    badge: "AT_RISK",
    dataReadiness: "LOW",
    riskSeverity: "HIGH",
    expectedValue: 270000,
    baseScore: 63,
    tagSlugs: ["high-risk", "foundation-first"]
  }),
  opp("knowledge-article-answering", "Knowledge article answering", "knowledge-article-search", {
    typeCode: "KNOWLEDGE_SEARCH",
    status: "APPROVED",
    badge: "HIGH_CONFIDENCE",
    dataReadiness: "HIGH",
    riskSeverity: "LOW",
    expectedValue: 320000,
    baseScore: 82,
    tagSlugs: ["quick-win", "data-ready"]
  }),
  opp("assortment-pricing-anomaly-detection", "Assortment and pricing anomaly detection", "assortment-pricing-review", {
    typeCode: "ANOMALY_DETECTION",
    status: "PRIORITIZED",
    badge: "STRATEGIC",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 680000,
    baseScore: 78,
    tagSlugs: ["retail"]
  }),
  opp("claims-fraud-indicator-screening", "Claims fraud indicator screening", "claims-adjudication", {
    typeCode: "ANOMALY_DETECTION",
    status: "ASSESSING",
    badge: "AT_RISK",
    dataReadiness: "LOW",
    riskSeverity: "HIGH",
    expectedValue: 620000,
    baseScore: 65,
    tagSlugs: ["finance", "high-risk"]
  }),
  opp("smart-reserve-recommendations", "Smart reserve recommendations", "claims-intake-triage", {
    typeCode: "FORECASTING_OPTIMIZATION",
    status: "IDENTIFIED",
    badge: "STRATEGIC",
    dataReadiness: "LOW",
    riskSeverity: "HIGH",
    expectedValue: 510000,
    baseScore: 62,
    tagSlugs: ["finance", "foundation-first"]
  }),
  opp("invoice-duplicate-payment-watch", "Invoice duplicate payment watch", "accounts-payable-matching", {
    typeCode: "ANOMALY_DETECTION",
    status: "APPROVED",
    badge: "HIGH_CONFIDENCE",
    dataReadiness: "HIGH",
    riskSeverity: "LOW",
    expectedValue: 360000,
    baseScore: 84,
    tagSlugs: ["finance", "data-ready"]
  }),
  opp("collections-email-drafting-assistant", "Collections email drafting assistant", "billing-exception-management", {
    typeCode: "COPILOT",
    status: "DRAFT",
    badge: "QUICK_WIN",
    dataReadiness: "MEDIUM",
    riskSeverity: "LOW",
    expectedValue: 150000,
    baseScore: 67,
    tagSlugs: ["quick-win", "finance"]
  }),
  opp("regulatory-obligation-extraction", "Regulatory obligation extraction", "regulatory-horizon-scanning", {
    typeCode: "EXTRACTION_AUTOMATION",
    status: "PRIORITIZED",
    badge: "HIGH_CONFIDENCE",
    dataReadiness: "HIGH",
    riskSeverity: "MEDIUM",
    expectedValue: 345000,
    baseScore: 79,
    subProcessSlug: "regulatory-obligation-mapping",
    tagSlugs: ["finance", "compliance-heavy"]
  }),
  opp("policy-gap-detection", "Policy gap detection", "policy-procedure-review", {
    typeCode: "ANOMALY_DETECTION",
    status: "IDENTIFIED",
    badge: "STRATEGIC",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 225000,
    baseScore: 68,
    tagSlugs: ["compliance-heavy"]
  }),
  opp("complaint-escalation-predictor", "Complaint escalation predictor", "complaint-handling", {
    typeCode: "ANOMALY_DETECTION",
    status: "ASSESSING",
    badge: "STRATEGIC",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 210000,
    baseScore: 69,
    tagSlugs: ["retail", "customer-facing"]
  }),
  opp("contact-center-after-call-summary", "Contact center after call summary", "contact-center-case-resolution", {
    typeCode: "DOCUMENT_INTELLIGENCE",
    status: "LIVE",
    badge: "QUICK_WIN",
    dataReadiness: "HIGH",
    riskSeverity: "LOW",
    expectedValue: 280000,
    realizedValue: 94000,
    baseScore: 87,
    tagSlugs: ["quick-win", "retail", "customer-facing", "data-ready"]
  }),
  opp("employee-policy-search", "Employee policy search", "hr-service-desk", {
    typeCode: "KNOWLEDGE_SEARCH",
    status: "LIVE",
    badge: "QUICK_WIN",
    dataReadiness: "HIGH",
    riskSeverity: "LOW",
    expectedValue: 180000,
    realizedValue: 76000,
    baseScore: 88,
    tagSlugs: ["quick-win", "data-ready"]
  }),
  opp("resume-screening-bias-monitor", "Resume screening bias monitor", "talent-screening-shortlisting", {
    typeCode: "ANOMALY_DETECTION",
    status: "BLOCKED",
    badge: "AT_RISK",
    dataReadiness: "LOW",
    riskSeverity: "CRITICAL",
    expectedValue: 140000,
    baseScore: 49,
    tagSlugs: ["high-risk", "compliance-heavy", "foundation-first"]
  }),
  opp("promotion-lift-forecasting", "Promotion lift forecasting", "demand-forecasting", {
    typeCode: "FORECASTING_OPTIMIZATION",
    status: "APPROVED",
    badge: "STRATEGIC",
    dataReadiness: "HIGH",
    riskSeverity: "MEDIUM",
    expectedValue: 720000,
    baseScore: 83,
    subProcessSlug: "promotional-lift-modeling",
    tagSlugs: ["retail", "data-ready"]
  }),
  opp("stockout-risk-alerting", "Stockout risk alerting", "replenishment-planning", {
    typeCode: "ANOMALY_DETECTION",
    status: "PRIORITIZED",
    badge: "STRATEGIC",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 470000,
    baseScore: 75,
    tagSlugs: ["retail"]
  }),
  opp("supplier-contract-risk-review", "Supplier contract risk review", "supplier-risk-monitoring", {
    typeCode: "DOCUMENT_INTELLIGENCE",
    status: "ASSESSING",
    badge: "AT_RISK",
    dataReadiness: "LOW",
    riskSeverity: "HIGH",
    expectedValue: 330000,
    baseScore: 60,
    tagSlugs: ["manufacturing", "compliance-heavy", "high-risk"]
  }),
  opp("requisition-category-classification", "Requisition category classification", "purchase-requisition-processing", {
    typeCode: "CLASSIFICATION_ROUTING",
    status: "IDENTIFIED",
    badge: "QUICK_WIN",
    dataReadiness: "MEDIUM",
    riskSeverity: "LOW",
    expectedValue: 160000,
    baseScore: 71,
    tagSlugs: ["manufacturing", "quick-win"]
  }),
  opp("production-shift-handover-summary", "Production shift handover summary", "production-incident-triage", {
    typeCode: "DOCUMENT_INTELLIGENCE",
    status: "DRAFT",
    badge: "HIGH_CONFIDENCE",
    dataReadiness: "MEDIUM",
    riskSeverity: "LOW",
    expectedValue: 175000,
    baseScore: 64,
    tagSlugs: ["manufacturing"]
  }),
  opp("machine-alert-clustering", "Machine alert clustering", "preventive-maintenance-planning", {
    typeCode: "ANOMALY_DETECTION",
    status: "PRIORITIZED",
    badge: "STRATEGIC",
    dataReadiness: "LOW",
    riskSeverity: "HIGH",
    expectedValue: 420000,
    baseScore: 68,
    tagSlugs: ["manufacturing", "foundation-first"]
  }),
  opp("defect-cause-knowledge-assistant", "Defect cause knowledge assistant", "visual-quality-inspection-review", {
    typeCode: "KNOWLEDGE_SEARCH",
    status: "APPROVED",
    badge: "HIGH_CONFIDENCE",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 310000,
    baseScore: 80,
    tagSlugs: ["manufacturing"]
  }),
  opp("change-freeze-impact-analysis", "Change freeze impact analysis", "change-request-review", {
    typeCode: "DOCUMENT_INTELLIGENCE",
    status: "BLOCKED",
    badge: "AT_RISK",
    dataReadiness: "LOW",
    riskSeverity: "HIGH",
    expectedValue: 220000,
    baseScore: 53,
    tagSlugs: ["high-risk", "foundation-first"]
  }),
  opp("self-service-ticket-deflection", "Self-service ticket deflection", "knowledge-article-search", {
    typeCode: "KNOWLEDGE_SEARCH",
    status: "IN_PROGRESS",
    badge: "QUICK_WIN",
    dataReadiness: "HIGH",
    riskSeverity: "LOW",
    expectedValue: 260000,
    baseScore: 84,
    tagSlugs: ["quick-win", "data-ready"]
  }),
  opp("markdown-optimization-copilot", "Markdown optimization copilot", "assortment-pricing-review", {
    typeCode: "COPILOT",
    status: "PRIORITIZED",
    badge: "STRATEGIC",
    dataReadiness: "MEDIUM",
    riskSeverity: "MEDIUM",
    expectedValue: 590000,
    baseScore: 77,
    tagSlugs: ["retail"]
  })
];

const INITIATIVES = [
  ["claims-automation-wave-1", "Claims automation wave 1", "automated-claims-handling", "COMPLETED", 540000],
  ["hr-service-copilot-rollout", "HR service copilot rollout", "hr-support-copilot", "COMPLETED", 120000],
  ["invoice-intake-automation-rollout", "Invoice intake automation rollout", "invoice-data-extraction", "COMPLETED", 180000],
  ["demand-sensing-pilot", "Demand sensing pilot", "demand-forecasting", "IN_PROGRESS", 420000],
  ["contact-center-assist-rollout", "Contact center assist rollout", "contact-center-agent-assistant", "IN_PROGRESS", 360000],
  ["portfolio-email-routing-foundation", "Portfolio email routing foundation", "incoming-email-classification", "IN_PROGRESS", 95000],
  ["regulatory-search-program", "Regulatory search program", "regulatory-document-search", "PLANNED", 85000],
  ["itsm-triage-autopilot", "ITSM triage autopilot", "it-ticket-prioritization", "COMPLETED", 130000],
  ["contract-intelligence-program", "Contract intelligence program", "contract-summarization", "IN_PROGRESS", 210000],
  ["maintenance-recommendation-pilot", "Maintenance recommendation pilot", "predictive-maintenance-recommendations", "PLANNED", 240000]
];

function getBusinessOwnerEmail(processDefinition) {
  return processDefinition.businessUnitSlug === "financial-services"
    ? "claire.dubois@movetoai.demo"
    : "liam.chen@movetoai.demo";
}

function getSponsorEmail(processDefinition) {
  if (
    processDefinition.domainSlug === "risk-compliance" ||
    processDefinition.domainSlug === "hr-workforce" ||
    processDefinition.domainSlug === "it-service-operations"
  ) {
    return "julien.morel@movetoai.demo";
  }

  return "emma.collins@movetoai.demo";
}

function getAssessorEmail(processDefinition) {
  return processDefinition.domainSlug === "it-service-operations"
    ? "sofia.alvarez@movetoai.demo"
    : "marcus.reed@movetoai.demo";
}

function getBoardSlug(processDefinition, blueprint) {
  if (
    processDefinition.domainSlug === "risk-compliance" ||
    blueprint.riskSeverity === "HIGH" ||
    blueprint.riskSeverity === "CRITICAL" ||
    blueprint.tagSlugs.includes("compliance-heavy")
  ) {
    return "risk-and-compliance-council";
  }

  return "ai-portfolio-board";
}

function getDecisionStatus(blueprint, index) {
  if (["APPROVED", "IN_PROGRESS", "LIVE"].includes(blueprint.status)) {
    return "APPROVED";
  }

  if (blueprint.status === "BLOCKED") {
    return "DEFERRED";
  }

  if (blueprint.status === "PRIORITIZED" && index % 2 === 0) {
    return "NEEDS_INFO";
  }

  if (blueprint.status === "ASSESSING" && index % 4 === 0) {
    return "REJECTED";
  }

  return null;
}

function getTemplateCode(blueprint) {
  if (
    blueprint.badge === "QUICK_WIN" &&
    blueprint.riskSeverity !== "HIGH" &&
    blueprint.riskSeverity !== "CRITICAL"
  ) {
    return "QUICK_WIN_FILTER";
  }

  if (
    blueprint.riskSeverity === "HIGH" ||
    blueprint.riskSeverity === "CRITICAL" ||
    blueprint.tagSlugs.includes("foundation-first") ||
    blueprint.tagSlugs.includes("compliance-heavy")
  ) {
    return "ENTERPRISE_GOVERNANCE";
  }

  return "BALANCED_PORTFOLIO";
}

function getMetricValueMap(blueprint) {
  const readinessMap = {
    UNKNOWN: 42,
    LOW: 54,
    MEDIUM: 69,
    HIGH: 82,
    PRODUCTION_READY: 93
  };
  const riskControlMap = {
    LOW: 92,
    MEDIUM: 76,
    HIGH: 58,
    CRITICAL: 42
  };
  const complexityPenalty =
    blueprint.typeCode === "FORECASTING_OPTIMIZATION"
      ? 10
      : blueprint.typeCode === "WORKFLOW_AUTOMATION"
        ? 8
        : blueprint.typeCode === "COPILOT"
          ? 6
          : 4;
  const quickWinBoost = blueprint.badge === "QUICK_WIN" ? 10 : 0;
  const transformationalPenalty = blueprint.badge === "TRANSFORMATIONAL" ? 8 : 0;
  const strategicBoost =
    blueprint.badge === "STRATEGIC" || blueprint.badge === "TRANSFORMATIONAL" ? 10 : 0;
  const liveBoost = blueprint.status === "LIVE" ? 6 : blueprint.status === "IN_PROGRESS" ? 3 : 0;

  return {
    VALUE_POTENTIAL: clamp(blueprint.baseScore + 8),
    FEASIBILITY: clamp(
      blueprint.baseScore - complexityPenalty + Math.round(readinessMap[blueprint.dataReadiness] / 10) - 3
    ),
    TIME_TO_VALUE: clamp(blueprint.baseScore + quickWinBoost - transformationalPenalty),
    DATA_READINESS: readinessMap[blueprint.dataReadiness],
    ADOPTION_READINESS: clamp(
      blueprint.baseScore + liveBoost - (blueprint.riskSeverity === "HIGH" ? 4 : 0)
    ),
    RISK_CONTROL: riskControlMap[blueprint.riskSeverity],
    STRATEGIC_ALIGNMENT: clamp(blueprint.baseScore + strategicBoost),
    COMPLIANCE_FIT: clamp(
      72 + (blueprint.tagSlugs.includes("compliance-heavy") ? 10 : 0) - (blueprint.riskSeverity === "CRITICAL" ? 8 : 0)
    ),
    INTEGRATION_READINESS: clamp(
      blueprint.baseScore - Math.round(complexityPenalty / 2) + Math.round(readinessMap[blueprint.dataReadiness] / 20)
    ),
    CHANGE_READINESS: clamp(
      blueprint.baseScore + liveBoost - (blueprint.badge === "TRANSFORMATIONAL" ? 10 : 0)
    )
  };
}

function calculateOverallScore(template, metricMap) {
  const weighted = template.dimensions.reduce((sum, dimension) => {
    const score = metricMap[dimension.key];
    return sum + score * (dimension.weight / 100);
  }, 0);

  return Number(weighted.toFixed(2));
}

function buildSummary(processDefinition, blueprint) {
  return `${blueprint.title} is positioned on ${processDefinition.name.toLowerCase()} to remove manual steps, improve decision speed, and create a governed path to value.`;
}

function buildHypothesis(processDefinition, blueprint) {
  return `If Move to AI operationalizes ${blueprint.title.toLowerCase()} for ${processDefinition.name.toLowerCase()}, the team can reduce manual effort, improve cycle time, and move a clearer business case into governance.`;
}

function buildDecisionSummary(blueprint, decisionStatus) {
  if (decisionStatus === "APPROVED") {
    return `${blueprint.title} is approved for the next delivery wave.`;
  }
  if (decisionStatus === "DEFERRED") {
    return `${blueprint.title} is deferred until dependency and data concerns are addressed.`;
  }
  if (decisionStatus === "REJECTED") {
    return `${blueprint.title} is rejected in its current form.`;
  }
  return `${blueprint.title} needs more evidence before final approval.`;
}

async function seedPlans() {
  const plans = {};

  for (const plan of PLAN_DEFINITIONS) {
    const subscriptionPlan = await prisma.subscriptionPlan.upsert({
      where: { planType: plan.planType },
      update: {
        name: plan.name,
        description: plan.description,
        displayOrder: plan.displayOrder,
        isActive: true,
        isPublic: true
      },
      create: {
        planType: plan.planType,
        name: plan.name,
        description: plan.description,
        displayOrder: plan.displayOrder,
        isActive: true,
        isPublic: true
      }
    });

    await prisma.planFeature.deleteMany({ where: { planId: subscriptionPlan.id } });
    await prisma.planLimit.deleteMany({ where: { planId: subscriptionPlan.id } });

    await prisma.planFeature.createMany({
      data: plan.features.map(([featureKey, label, enabled]) => ({
        planId: subscriptionPlan.id,
        featureKey,
        label,
        enabled
      }))
    });

    await prisma.planLimit.createMany({
      data: plan.limits.map(([limitKey, scope, period, limitValue, description]) => ({
        planId: subscriptionPlan.id,
        limitKey,
        scope,
        period,
        limitValue,
        description
      }))
    });

    plans[plan.planType] = await prisma.subscriptionPlan.findUnique({
      where: { id: subscriptionPlan.id },
      include: {
        features: true,
        limits: true
      }
    });
  }

  return plans;
}

async function seedPermissions() {
  const permissions = {};

  for (const [key, name] of PERMISSIONS) {
    permissions[key] = await prisma.permission.upsert({
      where: { key },
      update: { name },
      create: {
        key,
        name,
        description: `${name} permission for the Move to AI demo workspace.`
      }
    });
  }

  return permissions;
}

async function cleanupDemoData() {
  const demoUsers = await prisma.user.findMany({
    where: {
      email: {
        in: USER_DEFINITIONS.map((user) => user.email)
      }
    },
    select: { id: true }
  });

  const demoUserIds = demoUsers.map((user) => user.id);

  if (demoUserIds.length > 0) {
    await prisma.session.deleteMany({
      where: {
        userId: {
          in: demoUserIds
        }
      }
    });

    await prisma.account.deleteMany({
      where: {
        userId: {
          in: demoUserIds
        }
      }
    });
  }

  const existingTenant = await prisma.tenant.findFirst({
    where: { slug: DEMO_TENANT_SLUG },
    select: { id: true }
  });

  if (existingTenant) {
    const workspaces = await prisma.workspace.findMany({
      where: { tenantId: existingTenant.id },
      select: { id: true }
    });
    const workspaceIds = workspaces.map((w) => w.id);

    if (workspaceIds.length > 0) {
      await prisma.opportunity.deleteMany({
        where: { workspaceId: { in: workspaceIds } }
      });
    }

    await prisma.tenant.delete({
      where: {
        id: existingTenant.id
      }
    });
  }

  if (demoUserIds.length > 0) {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: demoUserIds
        }
      }
    });
  }
}

async function main() {
  const plans = await seedPlans();
  const permissions = await seedPermissions();
  await cleanupDemoData();

  const tenant = await prisma.tenant.create({
    data: {
      name: "Northstar Group Demo",
      slug: DEMO_TENANT_SLUG,
      subscriptionPlanId: plans.ENTERPRISE.id,
      subscriptionStatus: "ACTIVE",
      billingEmail: "billing@movetoai.demo",
      trialEndsAt: daysFromNow(30),
      planActivatedAt: daysAgo(120),
      settings: {
        demoMode: true,
        currentPlan: "ENTERPRISE",
        sectors: ["finance", "retail", "manufacturing"],
        planShowcase: {
          freePreview: {
            workspaceLimit: 1,
            userLimit: 5,
            processLimit: 15,
            opportunityLimit: 30,
            aiRequestLimitPerMonth: 30,
            lockedFeatures: [
              "Custom scoring",
              "Advanced workflows",
              "Portfolio governance",
              "Multiple business units",
              "SSO",
              "SCIM",
              "Full audit trail"
            ]
          },
          proHighlights: [
            "Custom scoring",
            "Governance workflows",
            "Portfolio collaboration",
            "Advanced exports"
          ],
          enterpriseHighlights: [
            "Multi-business-unit rollout",
            "SSO and SCIM",
            "Full audit trail",
            "Centralized administration",
            "API access"
          ]
        }
      }
    }
  });

  const workspace = await prisma.workspace.create({
    data: {
      tenantId: tenant.id,
      name: "Executive AI Portfolio",
      slug: DEMO_WORKSPACE_SLUG,
      defaultLocale: "EN",
      status: "ACTIVE",
      settings: {
        demoMode: true,
        sectors: ["finance", "retail", "manufacturing"],
        narrative: "Enterprise showcase workspace for Move to AI.",
        freePreview: {
          usersUsed: 5,
          usersAllowed: 5,
          processesUsed: 15,
          processesAllowed: 15,
          opportunitiesUsed: 30,
          opportunitiesAllowed: 30,
          aiRequestsUsed: 30,
          aiRequestsAllowed: 30,
          upgradePrompt:
            "Upgrade to Pro to unlock custom scoring and governance. Upgrade to Enterprise for multi-BU rollout, audit, SSO, and centralized admin."
        }
      }
    }
  });

  const roleMap = {};
  for (const roleDefinition of ROLE_DEFINITIONS) {
    roleMap[roleDefinition.code] = await prisma.role.create({
      data: {
        workspaceId: workspace.id,
        code: roleDefinition.code,
        name: roleDefinition.name,
        description: roleDefinition.description,
        isSystem: true,
        permissions: {
          create: roleDefinition.permissionKeys.map((permissionKey) => ({
            permissionId: permissions[permissionKey].id
          }))
        }
      }
    });
  }

  const userMap = {};

  for (const [index, userDefinition] of USER_DEFINITIONS.entries()) {
    userMap[userDefinition.email] = await prisma.user.create({
      data: {
        name: userDefinition.name,
        email: userDefinition.email,
        hashedPassword: hashPassword(userDefinition.password || DEMO_PASSWORD),
        preferredLocale: userDefinition.locale,
        status: "ACTIVE",
        jobTitle: userDefinition.jobTitle,
        userFunction: userDefinition.userFunction ?? "transformation_manager",
        isPlatformAdmin: userDefinition.isPlatformAdmin ?? false,
        preferences: userDefinition.preferences,
        lastLoginAt: daysAgo(index + 1)
      }
    });

    await prisma.membership.create({
      data: {
        userId: userMap[userDefinition.email].id,
        workspaceId: workspace.id,
        roleId: roleMap[userDefinition.roleCode].id,
        status: "ACTIVE",
        acceptedAt: daysAgo(90 - index),
        lastActiveAt: daysAgo(index + 1)
      }
    });
  }

  const businessUnitMap = {};
  for (const businessUnit of BUSINESS_UNITS) {
    businessUnitMap[businessUnit.slug] = await prisma.businessUnit.create({
      data: {
        workspaceId: workspace.id,
        name: businessUnit.name,
        slug: businessUnit.slug,
        code: businessUnit.code,
        description: businessUnit.description,
        nameTranslations: localize(businessUnit.name)
      }
    });
  }

  const domainMap = {};
  for (const [slug, name, businessUnitSlug] of DOMAINS) {
    domainMap[slug] = await prisma.domain.create({
      data: {
        workspaceId: workspace.id,
        businessUnitId: businessUnitMap[businessUnitSlug].id,
        name,
        slug,
        description: `${name} domain in the Move to AI demo portfolio.`,
        nameTranslations: localize(name)
      }
    });
  }

  const capabilityMap = {};
  for (const [slug, name, domainSlug, businessUnitSlug] of CAPABILITIES) {
    capabilityMap[slug] = await prisma.capability.create({
      data: {
        workspaceId: workspace.id,
        businessUnitId: businessUnitMap[businessUnitSlug].id,
        domainId: domainMap[domainSlug].id,
        name,
        slug,
        description: `${name} capability under ${domainMap[domainSlug].name}.`,
        nameTranslations: localize(name)
      }
    });
  }

  const applicationMap = {};
  for (const [slug, name, vendor] of APPLICATIONS) {
    applicationMap[slug] = await prisma.application.create({
      data: {
        workspaceId: workspace.id,
        name,
        slug,
        vendor,
        description: `${name} is part of the operational application landscape used in the demo.`
      }
    });
  }

  const dataSourceMap = {};
  for (const [slug, name] of DATA_SOURCES) {
    dataSourceMap[slug] = await prisma.dataSource.create({
      data: {
        workspaceId: workspace.id,
        name,
        slug,
        systemName: name,
        classification:
          slug.includes("ticket") || slug.includes("history") ? "Internal operational data" : "Operational source",
        description: `${name} feeds process and opportunity analysis in the demo workspace.`
      }
    });
  }

  for (const [applicationSlug, sourceSlugs] of Object.entries(APPLICATION_DATA_MAP)) {
    for (const sourceSlug of sourceSlugs) {
      await prisma.applicationDataSource.create({
        data: {
          applicationId: applicationMap[applicationSlug].id,
          dataSourceId: dataSourceMap[sourceSlug].id
        }
      });
    }
  }

  const processMap = {};
  const subProcessMap = {};
  const painPointMap = {};

  for (const processDefinition of PROCESS_DEFINITIONS) {
    const ownerEmail =
      processDefinition.domainSlug === "it-service-operations"
        ? "sofia.alvarez@movetoai.demo"
        : getBusinessOwnerEmail(processDefinition);

    const processRecord = await prisma.process.create({
      data: {
        workspaceId: workspace.id,
        businessUnitId: businessUnitMap[processDefinition.businessUnitSlug].id,
        domainId: domainMap[processDefinition.domainSlug].id,
        capabilityId: capabilityMap[processDefinition.capabilitySlug].id,
        ownerId: userMap[ownerEmail].id,
        name: processDefinition.name,
        slug: processDefinition.slug,
        description: processDefinition.description,
        nameTranslations: localize(processDefinition.name)
      }
    });

    processMap[processDefinition.slug] = processRecord;

    painPointMap[processDefinition.slug] = await prisma.painPoint.create({
      data: {
        workspaceId: workspace.id,
        domainId: domainMap[processDefinition.domainSlug].id,
        capabilityId: capabilityMap[processDefinition.capabilitySlug].id,
        processId: processRecord.id,
        title: processDefinition.painPointTitle,
        description: processDefinition.painPointDescription,
        severity: processDefinition.painPointSeverity,
        nameTranslations: localize(processDefinition.painPointTitle)
      }
    });

    for (const [slug, name] of processDefinition.subProcesses) {
      subProcessMap[slug] = await prisma.subProcess.create({
        data: {
          workspaceId: workspace.id,
          processId: processRecord.id,
          name,
          slug,
          description: `${name} is a sub-process inside ${processDefinition.name}.`,
          nameTranslations: localize(name)
        }
      });
    }

    for (const applicationSlug of processDefinition.applications) {
      await prisma.processApplication.create({
        data: {
          processId: processRecord.id,
          applicationId: applicationMap[applicationSlug].id
        }
      });
    }

    for (const sourceSlug of processDefinition.dataSources) {
      await prisma.processDataSource.create({
        data: {
          processId: processRecord.id,
          dataSourceId: dataSourceMap[sourceSlug].id
        }
      });
    }
  }

  const kpiMap = {};
  for (const kpi of KPI_DEFINITIONS) {
    kpiMap[kpi.slug] = await prisma.kPI.create({
      data: {
        workspaceId: workspace.id,
        processId: processMap[kpi.processSlug].id,
        name: kpi.name,
        slug: kpi.slug,
        unit: kpi.unit,
        metricType: kpi.metricType,
        description: `${kpi.name} is tracked in the demo workspace to prove business value.`,
        nameTranslations: localize(kpi.name)
      }
    });
  }

  const tagMap = {};
  for (const [slug, name, color] of TAGS) {
    tagMap[slug] = await prisma.tag.create({
      data: {
        workspaceId: workspace.id,
        name,
        slug,
        color,
        description: `${name} tag in the Move to AI demo workspace.`,
        nameTranslations: localize(name)
      }
    });
  }

  const opportunityTypeMap = {};
  for (const [code, name] of OPPORTUNITY_TYPES) {
    opportunityTypeMap[code] = await prisma.opportunityType.create({
      data: {
        workspaceId: workspace.id,
        code,
        name,
        description: `${name} pattern for AI opportunities.`,
        isSystem: true,
        nameTranslations: localize(name)
      }
    });
  }

  const scoreTemplateMap = {};
  const scoreDimensionMap = {};
  for (const templateDefinition of SCORE_TEMPLATES) {
    const templateRecord = await prisma.scoreTemplate.create({
      data: {
        workspaceId: workspace.id,
        code: templateDefinition.code,
        name: templateDefinition.name,
        description: templateDefinition.description,
        isDefault: templateDefinition.isDefault,
        isSystem: true,
        nameTranslations: localize(templateDefinition.name)
      }
    });

    scoreTemplateMap[templateDefinition.code] = {
      ...templateRecord,
      dimensions: []
    };
    scoreDimensionMap[templateDefinition.code] = {};

    for (const [displayOrder, [key, name, metricType, weight]] of templateDefinition.dimensions.entries()) {
      const dimensionRecord = await prisma.scoreDimension.create({
        data: {
          scoreTemplateId: templateRecord.id,
          key,
          name,
          metricType,
          weight: decimal(weight),
          displayOrder
        }
      });

      scoreTemplateMap[templateDefinition.code].dimensions.push({
        id: dimensionRecord.id,
        key,
        weight
      });
      scoreDimensionMap[templateDefinition.code][key] = dimensionRecord;
    }
  }

  const boardMap = {};
  boardMap["ai-portfolio-board"] = await prisma.decisionBoard.create({
    data: {
      workspaceId: workspace.id,
      chairId: userMap["emma.collins@movetoai.demo"].id,
      businessUnitId: null,
      name: "AI Portfolio Board",
      slug: "ai-portfolio-board",
      description: "Primary board for opportunity prioritization and portfolio sequencing.",
      nameTranslations: localize("AI Portfolio Board")
    }
  });
  boardMap["risk-and-compliance-council"] = await prisma.decisionBoard.create({
    data: {
      workspaceId: workspace.id,
      chairId: userMap["julien.morel@movetoai.demo"].id,
      businessUnitId: businessUnitMap["financial-services"].id,
      name: "Risk and Compliance Council",
      slug: "risk-and-compliance-council",
      description: "Secondary board for higher-risk and regulated use cases.",
      nameTranslations: localize("Risk and Compliance Council")
    }
  });

  const reviewMeetingMap = {};
  reviewMeetingMap["portfolio-board-q1"] = await prisma.reviewMeeting.create({
    data: {
      workspaceId: workspace.id,
      decisionBoardId: boardMap["ai-portfolio-board"].id,
      title: "Q1 Portfolio Board",
      scheduledAt: daysAgo(110),
      heldAt: daysAgo(110),
      status: "COMPLETED",
      summary: "First formal portfolio review covering finance and customer operations opportunities.",
      notes: "Board approved quick wins and requested deeper assessment for high-risk items."
    }
  });
  reviewMeetingMap["portfolio-board-q2"] = await prisma.reviewMeeting.create({
    data: {
      workspaceId: workspace.id,
      decisionBoardId: boardMap["ai-portfolio-board"].id,
      title: "Q2 Portfolio Board",
      scheduledAt: daysAgo(40),
      heldAt: daysAgo(40),
      status: "COMPLETED",
      summary: "Focused on delivery readiness and live value realization.",
      notes: "Board confirmed rollout sequence for contact center and supply chain initiatives."
    }
  });
  reviewMeetingMap["risk-council-q1"] = await prisma.reviewMeeting.create({
    data: {
      workspaceId: workspace.id,
      decisionBoardId: boardMap["risk-and-compliance-council"].id,
      title: "Q1 Risk Council",
      scheduledAt: daysAgo(95),
      heldAt: daysAgo(95),
      status: "COMPLETED",
      summary: "Reviewed regulated document intelligence and HR screening proposals.",
      notes: "Required model risk and data governance evidence before approval."
    }
  });
  reviewMeetingMap["risk-council-q2"] = await prisma.reviewMeeting.create({
    data: {
      workspaceId: workspace.id,
      decisionBoardId: boardMap["risk-and-compliance-council"].id,
      title: "Q2 Risk Council",
      scheduledAt: daysAgo(25),
      heldAt: daysAgo(25),
      status: "COMPLETED",
      summary: "Reviewed risk posture on change and recruitment-related opportunities.",
      notes: "Deferred high-risk items pending controls and data quality remediation."
    }
  });

  const opportunityMap = {};
  const opportunityBlueprintMap = {};

  for (const [index, originalBlueprint] of OPPORTUNITIES.entries()) {
    const processDefinition = PROCESS_DEFINITIONS.find(
      (processItem) => processItem.slug === originalBlueprint.processSlug
    );
    const templateCode = originalBlueprint.templateCode || getTemplateCode(originalBlueprint);
    const blueprint = {
      ...originalBlueprint,
      templateCode,
      ownerEmail: originalBlueprint.ownerEmail || getBusinessOwnerEmail(processDefinition),
      sponsorEmail: originalBlueprint.sponsorEmail || getSponsorEmail(processDefinition),
      assessorEmail: originalBlueprint.assessorEmail || getAssessorEmail(processDefinition)
    };
    const metricMap = getMetricValueMap(blueprint);
    const overallScore = calculateOverallScore(scoreTemplateMap[templateCode], metricMap);
    const createdAt = daysAgo(160 - index * 2);

    opportunityBlueprintMap[blueprint.slug] = {
      ...blueprint,
      processDefinition,
      metricMap,
      overallScore,
      decisionStatus: getDecisionStatus(blueprint, index)
    };

    const opportunityRecord = await prisma.opportunity.create({
      data: {
        workspaceId: workspace.id,
        businessUnitId: businessUnitMap[processDefinition.businessUnitSlug].id,
        domainId: domainMap[processDefinition.domainSlug].id,
        capabilityId: capabilityMap[processDefinition.capabilitySlug].id,
        processId: processMap[processDefinition.slug].id,
        subProcessId: blueprint.subProcessSlug ? subProcessMap[blueprint.subProcessSlug].id : null,
        painPointId: painPointMap[processDefinition.slug].id,
        ownerId: userMap[blueprint.ownerEmail].id,
        sponsorId: userMap[blueprint.sponsorEmail].id,
        createdById: userMap["marcus.reed@movetoai.demo"].id,
        opportunityTypeId: opportunityTypeMap[blueprint.typeCode].id,
        scoreTemplateId: scoreTemplateMap[templateCode].id,
        title: blueprint.title,
        titleTranslations: localize(blueprint.title),
        summary: buildSummary(processDefinition, blueprint),
        summaryTranslations: localize(blueprint.title),
        problemStatement: processDefinition.painPointDescription,
        aiHypothesis: buildHypothesis(processDefinition, blueprint),
        status: blueprint.status,
        badge: blueprint.badge,
        dataReadiness: blueprint.dataReadiness,
        riskSeverity: blueprint.riskSeverity,
        expectedValue: decimal(blueprint.expectedValue),
        realizedValue: decimal(blueprint.realizedValue),
        overallScore: decimal(overallScore),
        currencyCode: "USD",
        createdAt
      }
    });

    opportunityMap[blueprint.slug] = opportunityRecord;

    const sectorTag =
      processDefinition.sector === "finance" ||
      processDefinition.sector === "retail" ||
      processDefinition.sector === "manufacturing"
        ? processDefinition.sector
        : null;
    const tagSlugs = Array.from(
      new Set(
        [
          ...blueprint.tagSlugs,
          sectorTag,
          blueprint.badge === "QUICK_WIN" ? "quick-win" : null,
          blueprint.riskSeverity === "HIGH" || blueprint.riskSeverity === "CRITICAL" ? "high-risk" : null,
          blueprint.dataReadiness === "HIGH" || blueprint.dataReadiness === "PRODUCTION_READY" ? "data-ready" : null
        ].filter(Boolean)
      )
    );

    for (const applicationSlug of processDefinition.applications) {
      await prisma.opportunityApplication.create({
        data: {
          opportunityId: opportunityRecord.id,
          applicationId: applicationMap[applicationSlug].id
        }
      });
    }

    for (const sourceSlug of processDefinition.dataSources) {
      await prisma.opportunityDataSource.create({
        data: {
          opportunityId: opportunityRecord.id,
          dataSourceId: dataSourceMap[sourceSlug].id
        }
      });
    }

    for (const kpiSlug of processDefinition.kpis) {
      await prisma.opportunityKPI.create({
        data: {
          opportunityId: opportunityRecord.id,
          kpiId: kpiMap[kpiSlug].id
        }
      });
    }

    for (const tagSlug of tagSlugs) {
      await prisma.opportunityTag.create({
        data: {
          opportunityId: opportunityRecord.id,
          tagId: tagMap[tagSlug].id
        }
      });
    }

    const templateRecord = scoreTemplateMap[templateCode];
    const assessmentCreatedAt = daysAgo(120 - index);
    const currentAssessment = await prisma.opportunityAssessment.create({
      data: {
        opportunityId: opportunityRecord.id,
        scoreTemplateId: templateRecord.id,
        assessorId: userMap[blueprint.assessorEmail].id,
        assessmentType:
          blueprint.status === "LIVE" || blueprint.status === "IN_PROGRESS" || blueprint.decisionStatus
            ? "GOVERNANCE"
            : "INITIAL",
        summary: `${blueprint.title} shows a ${overallScore.toFixed(0)} / 100 current opportunity score.`,
        notes: `Seeded demo assessment for ${blueprint.title}.`,
        recommendation:
          overallScore >= 80
            ? "Prioritize for immediate action."
            : overallScore >= 70
              ? "Keep in the active portfolio."
              : "Refine the business case before next board review.",
        valueScore: decimal(metricMap.VALUE_POTENTIAL),
        feasibilityScore: decimal(metricMap.FEASIBILITY),
        confidenceScore: decimal(metricMap.ADOPTION_READINESS || metricMap.STRATEGIC_ALIGNMENT),
        riskScore: decimal(metricMap.RISK_CONTROL || metricMap.COMPLIANCE_FIT),
        overallScore: decimal(overallScore),
        isCurrent: true,
        createdAt: assessmentCreatedAt
      }
    });

    for (const dimension of templateRecord.dimensions) {
      const rawValue = metricMap[dimension.key];
      const weightedValue = Number((rawValue * (dimension.weight / 100)).toFixed(4));

      await prisma.scoreResult.create({
        data: {
          opportunityAssessmentId: currentAssessment.id,
          scoreDimensionId: scoreDimensionMap[templateCode][dimension.key].id,
          rawValue: preciseDecimal(rawValue),
          normalizedValue: preciseDecimal(rawValue),
          weightedValue: preciseDecimal(weightedValue),
          notes: `${dimension.key} seeded from realistic demo assumptions.`
        }
      });
    }

    if (["APPROVED", "IN_PROGRESS", "LIVE", "BLOCKED"].includes(blueprint.status)) {
      const previousMetricMap = Object.fromEntries(
        Object.entries(metricMap).map(([key, value]) => [key, clamp(value - 8)])
      );
      const previousOverall = calculateOverallScore(templateRecord, previousMetricMap);
      const previousAssessment = await prisma.opportunityAssessment.create({
        data: {
          opportunityId: opportunityRecord.id,
          scoreTemplateId: templateRecord.id,
          assessorId: userMap["marcus.reed@movetoai.demo"].id,
          assessmentType: "INITIAL",
          summary: `Initial triage for ${blueprint.title}.`,
          notes: "Historic baseline assessment retained for the demo.",
          recommendation: "Capture the baseline and revisit with richer evidence.",
          valueScore: decimal(previousMetricMap.VALUE_POTENTIAL),
          feasibilityScore: decimal(previousMetricMap.FEASIBILITY),
          confidenceScore: decimal(
            previousMetricMap.ADOPTION_READINESS || previousMetricMap.STRATEGIC_ALIGNMENT
          ),
          riskScore: decimal(previousMetricMap.RISK_CONTROL || previousMetricMap.COMPLIANCE_FIT),
          overallScore: decimal(previousOverall),
          isCurrent: false,
          createdAt: daysAgo(170 - index)
        }
      });

      for (const dimension of templateRecord.dimensions) {
        const rawValue = previousMetricMap[dimension.key];
        const weightedValue = Number((rawValue * (dimension.weight / 100)).toFixed(4));

        await prisma.scoreResult.create({
          data: {
            opportunityAssessmentId: previousAssessment.id,
            scoreDimensionId: scoreDimensionMap[templateCode][dimension.key].id,
            rawValue: preciseDecimal(rawValue),
            normalizedValue: preciseDecimal(rawValue),
            weightedValue: preciseDecimal(weightedValue),
            notes: "Historic assessment value for the demo storyline."
          }
        });
      }
    }
  }

  const decisionMap = {};
  for (const [index, blueprint] of Object.values(opportunityBlueprintMap).entries()) {
    if (!blueprint.decisionStatus) {
      continue;
    }

    const boardSlug = getBoardSlug(blueprint.processDefinition, blueprint);
    const reviewMeetingSlug =
      boardSlug === "risk-and-compliance-council"
        ? index % 2 === 0
          ? "risk-council-q2"
          : "risk-council-q1"
        : index % 2 === 0
          ? "portfolio-board-q2"
          : "portfolio-board-q1";

    const decision = await prisma.decision.create({
      data: {
        workspaceId: workspace.id,
        opportunityId: opportunityMap[blueprint.slug].id,
        decisionBoardId: boardMap[boardSlug].id,
        reviewMeetingId: reviewMeetingMap[reviewMeetingSlug].id,
        decidedById:
          boardSlug === "risk-and-compliance-council"
            ? userMap["diego.herrera@movetoai.demo"].id
            : userMap["emma.collins@movetoai.demo"].id,
        status: blueprint.decisionStatus,
        summary: buildDecisionSummary(blueprint, blueprint.decisionStatus),
        rationale: `${blueprint.title} was reviewed against value, readiness, governance fit, and portfolio sequencing.`,
        approvedBudget:
          blueprint.decisionStatus === "APPROVED"
            ? decimal(Math.max(Math.round(blueprint.expectedValue * 0.18), 50000))
            : null,
        currencyCode: blueprint.decisionStatus === "APPROVED" ? "USD" : null,
        decidedAt: daysAgo(75 - index)
      }
    });

    decisionMap[blueprint.slug] = decision;

    await prisma.opportunity.update({
      where: { id: opportunityMap[blueprint.slug].id },
      data: {
        currentDecisionId: decision.id
      }
    });

    const approvalStatus =
      blueprint.decisionStatus === "APPROVED"
        ? "APPROVED"
        : blueprint.decisionStatus === "REJECTED"
          ? "REJECTED"
          : "PENDING";

    await prisma.approvalStep.create({
      data: {
        decisionId: decision.id,
        approverId: userMap[getBusinessOwnerEmail(blueprint.processDefinition)].id,
        stepOrder: 1,
        approverRoleLabel: "Business owner",
        status: approvalStatus,
        notes: "Business value and operating ownership reviewed.",
        dueDate: daysAgo(78 - index),
        actedAt: approvalStatus !== "PENDING" ? daysAgo(77 - index) : null
      }
    });

    await prisma.approvalStep.create({
      data: {
        decisionId: decision.id,
        approverId:
          boardSlug === "risk-and-compliance-council"
            ? userMap["diego.herrera@movetoai.demo"].id
            : userMap["marcus.reed@movetoai.demo"].id,
        stepOrder: 2,
        approverRoleLabel:
          boardSlug === "risk-and-compliance-council" ? "Risk reviewer" : "Portfolio manager",
        status: approvalStatus,
        notes: "Final governance and sequencing review.",
        dueDate: daysAgo(76 - index),
        actedAt: approvalStatus !== "PENDING" ? daysAgo(75 - index) : null
      }
    });

    if (blueprint.decisionStatus !== "APPROVED") {
      await prisma.actionItem.create({
        data: {
          workspaceId: workspace.id,
          opportunityId: opportunityMap[blueprint.slug].id,
          decisionId: decision.id,
          reviewMeetingId: reviewMeetingMap[reviewMeetingSlug].id,
          ownerId:
            blueprint.decisionStatus === "REJECTED"
              ? userMap["marcus.reed@movetoai.demo"].id
              : userMap["sofia.alvarez@movetoai.demo"].id,
          title:
            blueprint.decisionStatus === "REJECTED"
              ? `Refine business case for ${blueprint.title}`
              : `Close evidence gaps for ${blueprint.title}`,
          description:
            blueprint.decisionStatus === "REJECTED"
              ? "Capture a stronger value case or narrow the initial scope before re-submission."
              : "Document control design, baseline metrics, or dependency needs before the next review.",
          status: blueprint.decisionStatus === "REJECTED" ? "DONE" : "OPEN",
          dueDate: daysFromNow(21 + index),
          completedAt: blueprint.decisionStatus === "REJECTED" ? daysAgo(5) : null
        }
      });
    }
  }

  const initiativeMap = {};
  for (const [index, [slug, name, opportunitySlug, status, monthlyRealizedValue]] of INITIATIVES.entries()) {
    const blueprint = opportunityBlueprintMap[opportunitySlug];
    const initiative = await prisma.initiative.create({
      data: {
        workspaceId: workspace.id,
        businessUnitId: businessUnitMap[blueprint.processDefinition.businessUnitSlug].id,
        opportunityId: opportunityMap[opportunitySlug].id,
        decisionId: decisionMap[opportunitySlug]?.id ?? null,
        ownerId: userMap[getBusinessOwnerEmail(blueprint.processDefinition)].id,
        name,
        slug,
        description: `Delivery initiative for ${blueprint.title}.`,
        status,
        budgetAmount: decimal(Math.max(Math.round(blueprint.expectedValue * 0.22), 60000)),
        currencyCode: "USD",
        startDate: daysAgo(90 - index * 6),
        targetDate: daysFromNow(45 + index * 4),
        completedAt: status === "COMPLETED" ? daysAgo(10 + index) : null
      }
    });

    initiativeMap[slug] = initiative;

    await prisma.milestone.createMany({
      data: [
        {
          initiativeId: initiative.id,
          name: "Design and baseline alignment",
          description: "Validate process baseline, success metrics, and scope.",
          status: "DONE",
          dueDate: daysAgo(70 - index * 5),
          completedAt: daysAgo(68 - index * 5)
        },
        {
          initiativeId: initiative.id,
          name: "Pilot rollout",
          description: "Launch the first controlled pilot cohort.",
          status: status === "PLANNED" ? "PLANNED" : "DONE",
          dueDate: daysAgo(30 - index * 2),
          completedAt: status === "PLANNED" ? null : daysAgo(25 - index * 2)
        },
        {
          initiativeId: initiative.id,
          name: "Scale and governance handoff",
          description: "Expand coverage and hand over to BAU governance.",
          status: status === "COMPLETED" ? "DONE" : status === "IN_PROGRESS" ? "IN_PROGRESS" : "PLANNED",
          dueDate: daysFromNow(20 + index * 3),
          completedAt: status === "COMPLETED" ? daysAgo(8 + index) : null
        }
      ]
    });

    const primaryKpiId = kpiMap[blueprint.processDefinition.kpis[0]]?.id ?? null;
    const benefitMetric = await prisma.benefitMetric.create({
      data: {
        workspaceId: workspace.id,
        opportunityId: opportunityMap[opportunitySlug].id,
        initiativeId: initiative.id,
        kpiId: primaryKpiId,
        name: `${name} business value`,
        description: `Primary business value metric for ${name}.`,
        metricType: blueprint.expectedValue >= 500000 ? "FINANCIAL" : "EFFICIENCY",
        unit: blueprint.expectedValue >= 500000 ? "USD" : "%",
        targetValue:
          blueprint.expectedValue >= 500000
            ? preciseDecimal(blueprint.expectedValue)
            : preciseDecimal(25),
        currentValue:
          status === "PLANNED"
            ? preciseDecimal(0)
            : blueprint.expectedValue >= 500000
              ? preciseDecimal(Math.min(blueprint.realizedValue || monthlyRealizedValue * 3, blueprint.expectedValue))
              : preciseDecimal(status === "COMPLETED" ? 19 : 11)
      }
    });

    await prisma.baselineValue.create({
      data: {
        benefitMetricId: benefitMetric.id,
        value: blueprint.expectedValue >= 500000 ? preciseDecimal(0) : preciseDecimal(5),
        capturedAt: daysAgo(85 - index * 4),
        notes: "Baseline before the initiative started."
      }
    });

    const realizedPoints =
      status === "PLANNED"
        ? []
        : [
            {
              benefitMetricId: benefitMetric.id,
              value:
                blueprint.expectedValue >= 500000
                  ? preciseDecimal(monthlyRealizedValue)
                  : preciseDecimal(9),
              capturedAt: daysAgo(21),
              notes: "First realized value checkpoint."
            },
            {
              benefitMetricId: benefitMetric.id,
              value:
                blueprint.expectedValue >= 500000
                  ? preciseDecimal(
                      Math.min(
                        blueprint.realizedValue || monthlyRealizedValue * 2,
                        blueprint.expectedValue
                      )
                    )
                  : preciseDecimal(status === "COMPLETED" ? 19 : 13),
              capturedAt: daysAgo(7),
              notes: "Latest realized value checkpoint."
            }
          ];

    for (const realizedPoint of realizedPoints) {
      await prisma.realizedValue.create({ data: realizedPoint });
    }

    await prisma.adoptionMetric.create({
      data: {
        workspaceId: workspace.id,
        opportunityId: opportunityMap[opportunitySlug].id,
        initiativeId: initiative.id,
        name: `${name} adoption`,
        description: `Operational adoption signal for ${name}.`,
        unit: "%",
        metricType: "ADOPTION",
        baselineValue: preciseDecimal(0),
        targetValue: preciseDecimal(75),
        currentValue:
          status === "COMPLETED"
            ? preciseDecimal(82)
            : status === "IN_PROGRESS"
              ? preciseDecimal(46)
              : preciseDecimal(12),
        capturedAt: daysAgo(5)
      }
    });
  }

  const dependencies = [
    ["contact-center-agent-assistant", "incoming-email-classification"],
    ["billing-anomaly-detection", "invoice-data-extraction"],
    ["contract-summarization", "regulatory-obligation-extraction"],
    ["predictive-maintenance-recommendations", "machine-alert-clustering"],
    ["self-service-ticket-deflection", "knowledge-article-answering"],
    ["demand-forecasting", "promotion-lift-forecasting"]
  ];

  for (const [sourceSlug, targetSlug] of dependencies) {
    await prisma.dependency.create({
      data: {
        opportunityId: opportunityMap[sourceSlug].id,
        targetOpportunityId: opportunityMap[targetSlug].id,
        dependencyType: "OPPORTUNITY",
        title: `${opportunityBlueprintMap[sourceSlug].title} depends on ${opportunityBlueprintMap[targetSlug].title}`,
        description: "The target capability needs to be in place first to unlock full value.",
        isBlocking: true
      }
    });
  }

  await prisma.dependency.create({
    data: {
      opportunityId: opportunityMap["contact-center-agent-assistant"].id,
      targetInitiativeId: initiativeMap["portfolio-email-routing-foundation"].id,
      dependencyType: "INITIATIVE",
      title: "Agent assistant depends on email routing foundation",
      description: "Routing normalization is required before scaling the agent assist experience.",
      isBlocking: true
    }
  });

  for (const blueprint of Object.values(opportunityBlueprintMap)) {
    const owner = userMap[blueprint.ownerEmail];
    const sponsor = userMap[blueprint.sponsorEmail];
    const reviewer = userMap["diego.herrera@movetoai.demo"];

    const commentBodies = [];
    if (["APPROVED", "IN_PROGRESS", "LIVE"].includes(blueprint.status)) {
      commentBodies.push([
        owner.id,
        `The team has validated demand for ${blueprint.title.toLowerCase()} and confirmed the operating owner for rollout.`
      ]);
      commentBodies.push([
        sponsor.id,
        "This use case is commercially strong because it moves from process pain to governed value quickly."
      ]);
    } else if (blueprint.status === "PRIORITIZED" || blueprint.status === "ASSESSING") {
      commentBodies.push([
        userMap["marcus.reed@movetoai.demo"].id,
        `Keep ${blueprint.title.toLowerCase()} in the active portfolio while we tighten baseline and dependency evidence.`
      ]);
    } else {
      commentBodies.push([
        reviewer.id,
        "The current framing is useful, but the governance file still needs clearer control and readiness signals."
      ]);
    }

    for (const [index, [authorId, body]] of commentBodies.entries()) {
      await prisma.opportunityComment.create({
        data: {
          opportunityId: opportunityMap[blueprint.slug].id,
          authorId,
          body,
          createdAt: daysAgo(18 - index)
        }
      });
    }
  }

  for (const blueprint of Object.values(opportunityBlueprintMap)) {
    const riskItems = [];

    if (blueprint.riskSeverity === "HIGH" || blueprint.riskSeverity === "CRITICAL") {
      riskItems.push({
        title: `Control readiness risk for ${blueprint.title}`,
        description:
          "The use case needs stronger operating controls, clearer escalation paths, or governance evidence before it can scale.",
        severity: blueprint.riskSeverity,
        status: blueprint.status === "BLOCKED" ? "OPEN" : blueprint.status === "LIVE" ? "MITIGATED" : "OPEN"
      });
    }

    if (blueprint.dataReadiness === "LOW" || blueprint.tagSlugs.includes("foundation-first")) {
      riskItems.push({
        title: `Data foundation risk for ${blueprint.title}`,
        description:
          "Source quality, lineage, or access controls need remediation before model-driven outputs can be trusted.",
        severity: blueprint.riskSeverity === "CRITICAL" ? "CRITICAL" : "HIGH",
        status: blueprint.status === "LIVE" ? "MITIGATED" : "OPEN"
      });
    }

    for (const riskItem of riskItems) {
      await prisma.riskItem.create({
        data: {
          opportunityId: opportunityMap[blueprint.slug].id,
          ownerId:
            blueprint.processDefinition.domainSlug === "it-service-operations"
              ? userMap["sofia.alvarez@movetoai.demo"].id
              : userMap["diego.herrera@movetoai.demo"].id,
          title: riskItem.title,
          description: riskItem.description,
          severity: riskItem.severity,
          status: riskItem.status,
          mitigationPlan:
            "Use phased rollout, human review thresholds, and explicit board checkpoints to manage the risk.",
          dueDate: daysFromNow(30)
        }
      });
    }
  }

  for (const blueprint of Object.values(opportunityBlueprintMap)) {
    const frameworks = [];

    if (
      blueprint.processDefinition.domainSlug === "risk-compliance" ||
      blueprint.processDefinition.domainSlug === "finance-billing"
    ) {
      frameworks.push(["Model Risk Policy", "Model review evidence"]);
      frameworks.push(["SOX", "Financial control traceability"]);
    }

    if (
      blueprint.processDefinition.domainSlug === "hr-workforce" ||
      blueprint.processDefinition.domainSlug === "customer-operations"
    ) {
      frameworks.push(["GDPR", "Personal data handling"]);
    }

    if (blueprint.riskSeverity === "HIGH" || blueprint.riskSeverity === "CRITICAL") {
      frameworks.push(["EU AI Act", "High-risk system obligations"]);
    }

    const uniqueFrameworks = Array.from(new Map(frameworks.map((item) => [item[0], item])).values());

    for (const [framework, controlName] of uniqueFrameworks) {
      await prisma.complianceCheck.create({
        data: {
          opportunityId: opportunityMap[blueprint.slug].id,
          ownerId: userMap["diego.herrera@movetoai.demo"].id,
          framework,
          controlName,
          requirement: `${framework} control review for ${blueprint.title}.`,
          status:
            blueprint.status === "LIVE" || blueprint.status === "APPROVED"
              ? "PASSED"
              : blueprint.status === "BLOCKED"
                ? "FAILED"
                : "IN_REVIEW",
          notes:
            blueprint.status === "BLOCKED"
              ? "Blocked until control design and testing evidence are complete."
              : "Seeded demo control check."
        }
      });
    }
  }

  for (const [slug, initiative] of Object.entries(initiativeMap)) {
    const blueprint = opportunityBlueprintMap[INITIATIVES.find((item) => item[0] === slug)[2]];

    await prisma.attachment.create({
      data: {
        workspaceId: workspace.id,
        initiativeId: initiative.id,
        opportunityId: opportunityMap[blueprint.slug].id,
        uploadedById: userMap["julien.morel@movetoai.demo"].id,
        kind: "DOCUMENT",
        fileName: `${slug}.pdf`,
        storageKey: `demo/${slug}.pdf`,
        mimeType: "application/pdf",
        sizeBytes: 184320,
        metadata: {
          category: "initiative-brief",
          source: "seed"
        }
      }
    });
  }

  for (const [slug, decision] of Object.entries(decisionMap).slice(0, 8)) {
    await prisma.attachment.create({
      data: {
        workspaceId: workspace.id,
        decisionId: decision.id,
        opportunityId: opportunityMap[slug].id,
        reviewMeetingId: decision.reviewMeetingId,
        uploadedById: userMap["emma.collins@movetoai.demo"].id,
        kind: "DOCUMENT",
        fileName: `${slug}-decision-memo.pdf`,
        storageKey: `demo/${slug}-decision-memo.pdf`,
        mimeType: "application/pdf",
        sizeBytes: 98304,
        metadata: {
          category: "decision-memo",
          source: "seed"
        }
      }
    });
  }

  const enterpriseLimitMap = Object.fromEntries(
    plans.ENTERPRISE.limits.map((limit) => [limit.limitKey, limit])
  );
  const quotaConfigs = [
    ["WORKSPACES", "TOTAL", 1],
    ["USERS", "TOTAL", USER_DEFINITIONS.length],
    ["PROCESSES", "TOTAL", PROCESS_DEFINITIONS.length],
    ["OPPORTUNITIES", "TOTAL", OPPORTUNITIES.length],
    ["BUSINESS_UNITS", "TOTAL", BUSINESS_UNITS.length],
    ["AI_REQUESTS_PER_MONTH", "MONTHLY", 742]
  ];
  const quotaMap = {};

  for (const [limitKey, period, consumedValue] of quotaConfigs) {
    const planLimit = enterpriseLimitMap[limitKey];

    quotaMap[limitKey] = await prisma.usageQuota.create({
      data: {
        tenantId: tenant.id,
        workspaceId: workspace.id,
        planLimitId: planLimit.id,
        limitKey,
        scope: planLimit.scope,
        period,
        periodStart: period === "MONTHLY" ? monthStart(0) : daysAgo(180),
        periodEnd: period === "MONTHLY" ? monthEnd(0) : daysFromNow(180),
        allowedValue: planLimit.limitValue,
        consumedValue,
        resetAt: period === "MONTHLY" ? monthStart(1) : null
      }
    });
  }

  const usageEvents = [
    ["LOGIN", 48, "USERS", "Successful demo and internal logins", daysAgo(2)],
    ["AI_REQUEST", 136, "AI_REQUESTS_PER_MONTH", "Scoring and summarization requests", daysAgo(20)],
    ["AI_REQUEST", 94, "AI_REQUESTS_PER_MONTH", "Copilot and extraction prompt volume", daysAgo(10)],
    ["AI_REQUEST", 72, "AI_REQUESTS_PER_MONTH", "Governance review request volume", daysAgo(3)],
    ["PROCESS_CREATED", PROCESS_DEFINITIONS.length, "PROCESSES", "Initial process catalog import", daysAgo(150)],
    ["OPPORTUNITY_CREATED", OPPORTUNITIES.length, "OPPORTUNITIES", "Opportunity portfolio seeded for the demo", daysAgo(148)],
    ["USER_INVITED", USER_DEFINITIONS.length, "USERS", "Executive team onboarded into the workspace", daysAgo(140)],
    ["GOVERNANCE_REVIEW", 9, "OPPORTUNITIES", "Board and council review cycles", daysAgo(40)],
    ["EXPORT_TRIGGERED", 6, "OPPORTUNITIES", "Board export and steering material", daysAgo(18)],
    ["API_CALL", 240, "AI_REQUESTS_PER_MONTH", "Enterprise integration preview traffic", daysAgo(6)]
  ];

  for (const [type, quantity, limitKey, note, occurredAt] of usageEvents) {
    await prisma.usageEvent.create({
      data: {
        tenantId: tenant.id,
        workspaceId: workspace.id,
        userId: userMap["marcus.reed@movetoai.demo"].id,
        usageQuotaId: quotaMap[limitKey].id,
        type,
        quantity,
        occurredAt,
        metadata: {
          note,
          seeded: true
        }
      }
    });
  }

  await prisma.usageEvent.create({
    data: {
      tenantId: tenant.id,
      workspaceId: workspace.id,
      userId: userMap["emma.collins@movetoai.demo"].id,
      type: "AI_REQUEST",
      quantity: 30,
      occurredAt: daysAgo(1),
      metadata: {
        scenario: "free-preview",
        message:
          "This event mirrors a free workspace hitting its monthly AI request limit and needing an upgrade nudge."
      }
    }
  });

  const auditEntries = [
    ["workspace.seeded", "Workspace", workspace.id, "Seeded enterprise demo workspace.", "SYSTEM", null],
    ["plan.preview.loaded", "Tenant", tenant.id, "Loaded free, pro, and enterprise plan showcase data.", "SYSTEM", null],
    [
      "opportunity.approved",
      "Opportunity",
      opportunityMap["billing-anomaly-detection"].id,
      "Billing anomaly detection approved by the AI Portfolio Board.",
      "USER",
      userMap["emma.collins@movetoai.demo"].id
    ],
    [
      "opportunity.live",
      "Opportunity",
      opportunityMap["demand-forecasting"].id,
      "Demand forecasting is live with realized value visible in the portfolio.",
      "USER",
      userMap["marcus.reed@movetoai.demo"].id
    ],
    [
      "initiative.started",
      "Initiative",
      initiativeMap["contact-center-assist-rollout"].id,
      "Contact center assist rollout moved to delivery.",
      "USER",
      userMap["liam.chen@movetoai.demo"].id
    ],
    [
      "audit.preview.enabled",
      "Workspace",
      workspace.id,
      "Enterprise audit trail is enabled to demonstrate high-trust governance.",
      "SYSTEM",
      null
    ],
    [
      "free.limit.previewed",
      "Workspace",
      workspace.id,
      "Free plan preview state seeded to support upgrade nudges in onboarding.",
      "SYSTEM",
      null
    ],
    [
      "risk.deferred",
      "Opportunity",
      opportunityMap["resume-screening-bias-monitor"].id,
      "High-risk HR opportunity deferred pending fairness and control evidence.",
      "USER",
      userMap["diego.herrera@movetoai.demo"].id
    ],
    [
      "user.invited",
      "Membership",
      workspace.id,
      "Leadership team invited into the demo workspace.",
      "USER",
      userMap["julien.morel@movetoai.demo"].id
    ],
    [
      "value.realized",
      "Opportunity",
      opportunityMap["invoice-data-extraction"].id,
      "Invoice data extraction is already realizing measurable value.",
      "USER",
      userMap["claire.dubois@movetoai.demo"].id
    ]
  ];

  for (const [action, entityType, entityId, summary, actorType, actorUserId] of auditEntries) {
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        workspaceId: workspace.id,
        actorUserId,
        actorType,
        action,
        entityType,
        entityId,
        summary,
        metadata: {
          seeded: true
        }
      }
    });
  }

  console.log("Move to AI demo seed complete.");
  console.log(`Tenant: ${tenant.name}`);
  console.log(`Workspace: ${workspace.name}`);
  console.log(`Users: ${USER_DEFINITIONS.length}`);
  console.log(`Processes: ${PROCESS_DEFINITIONS.length}`);
  console.log(`Opportunities: ${OPPORTUNITIES.length}`);
  console.log(`Initiatives: ${INITIATIVES.length}`);
  console.log(`Demo password: ${DEMO_PASSWORD}`);
  console.log("Admin user: admin@movetoai.app / Admin123!");
}

main()
  .catch((error) => {
    console.error("Move to AI demo seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
