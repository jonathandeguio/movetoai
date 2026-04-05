import type { AssistantProvider } from "@/modules/ai-assistant/domain/provider";
import type {
  AssistantInsights,
  AssistantProcessContext,
  AssistantSuggestion
} from "@/modules/ai-assistant/model/assistant.types";

type UseCaseDefinition = {
  label: string;
  keywords: string[];
  buildSuggestions: (context: AssistantProcessContext, mainPainPoint: string) => AssistantSuggestion[];
};

const useCaseDefinitions: UseCaseDefinition[] = [
  {
    label: "Document intelligence",
    keywords: ["claim", "invoice", "contract", "document", "email", "regulatory", "policy"],
    buildSuggestions: (context, mainPainPoint) => [
      {
        title: `${context.processName} document intake assistant`,
        summary: `Extract, summarize, and route the documents behind ${mainPainPoint.toLowerCase()}.`,
        confidence: 86
      },
      {
        title: `${context.processName} summarization and extraction`,
        summary: `Reduce manual reading by turning long-form inputs into structured case data.`,
        confidence: 81
      },
      {
        title: `${context.processName} policy and evidence search`,
        summary: `Help teams find the right documents, clauses, and evidence faster during review.`,
        confidence: 77
      }
    ]
  },
  {
    label: "Copilot and knowledge assistant",
    keywords: ["support", "ticket", "hr", "contact", "service", "agent", "review", "research"],
    buildSuggestions: (context, mainPainPoint) => [
      {
        title: `${context.processName} team copilot`,
        summary: `Guide teams through ${mainPainPoint.toLowerCase()} with response drafting and next-step suggestions.`,
        confidence: 84
      },
      {
        title: `Knowledge assistant for ${context.processName}`,
        summary: `Surface the right policy, knowledge base article, or past case during execution.`,
        confidence: 79
      },
      {
        title: `${context.processName} response drafting assistant`,
        summary: `Reduce repetitive writing and accelerate consistent stakeholder communication.`,
        confidence: 75
      }
    ]
  },
  {
    label: "Classification and routing",
    keywords: ["class", "triage", "route", "intake", "queue", "mailbox", "request", "priority"],
    buildSuggestions: (context, mainPainPoint) => [
      {
        title: `${context.processName} triage and routing`,
        summary: `Classify incoming work and send it to the right queue before manual review of ${mainPainPoint.toLowerCase()} starts.`,
        confidence: 85
      },
      {
        title: `Priority classification for ${context.processName}`,
        summary: `Detect urgency, complexity, and the best handler earlier in the workflow.`,
        confidence: 80
      },
      {
        title: `${context.processName} intake tagging`,
        summary: `Apply consistent metadata so teams can filter, escalate, and monitor faster.`,
        confidence: 76
      }
    ]
  },
  {
    label: "Forecasting and anomaly detection",
    keywords: ["forecast", "billing", "anomaly", "demand", "quality", "risk", "monitor"],
    buildSuggestions: (context, mainPainPoint) => [
      {
        title: `${context.processName} anomaly detection`,
        summary: `Flag unusual patterns early where ${mainPainPoint.toLowerCase()} currently stays manual.`,
        confidence: 83
      },
      {
        title: `${context.processName} forecasting assistant`,
        summary: `Estimate volume, demand, or workload to improve planning and intervention timing.`,
        confidence: 78
      },
      {
        title: `${context.processName} risk signal monitor`,
        summary: `Surface emerging issues before they create cost, delay, or compliance pressure.`,
        confidence: 74
      }
    ]
  }
];

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getMainPainPoint(context: AssistantProcessContext) {
  const firstPainPoint = context.painPoints[0];
  if (!firstPainPoint) {
    return `manual work in ${context.processName}`;
  }

  return firstPainPoint.title;
}

function getSuggestedUseCaseType(context: AssistantProcessContext) {
  const haystack = normalizeText(
    [
      context.processName,
      context.processDescription,
      context.domainName,
      context.capabilityName,
      ...context.painPoints.flatMap((painPoint) => [painPoint.title, painPoint.description])
    ].join(" ")
  );

  let bestMatch = useCaseDefinitions[0];
  let bestScore = -1;

  for (const definition of useCaseDefinitions) {
    const score = definition.keywords.reduce((count, keyword) => {
      return haystack.includes(keyword) ? count + 1 : count;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = definition;
    }
  }

  if (bestScore <= 0) {
    return {
      label: "Workflow automation",
      buildSuggestions: (_context: AssistantProcessContext, mainPainPoint: string) => [
        {
          title: `${context.processName} workflow assistant`,
          summary: `Reduce repetitive coordination around ${mainPainPoint.toLowerCase()} with guided automation.`,
          confidence: 78
        },
        {
          title: `${context.processName} decision support`,
          summary: `Give teams the right next action and supporting context at the point of work.`,
          confidence: 73
        },
        {
          title: `${context.processName} handoff reduction`,
          summary: `Shorten cycle time by structuring inputs before the next team picks them up.`,
          confidence: 70
        }
      ]
    };
  }

  return bestMatch;
}

function getPainPointSummary(context: AssistantProcessContext) {
  if (context.painPoints.length === 0) {
    return `No explicit pain point is captured yet for ${context.processName}. Start with the manual or repetitive step creating the most delay and review load.`;
  }

  const topPainPoints = context.painPoints.slice(0, 2).map((painPoint) => painPoint.title);
  const joinedPainPoints =
    topPainPoints.length === 1
      ? topPainPoints[0]
      : `${topPainPoints[0]} and ${topPainPoints[1]}`;

  const readinessHint =
    context.applicationCount > 0 || context.dataSourceCount > 0
      ? "The surrounding systems and data already give this process a credible AI starting point."
      : "The process still needs clearer application or data context before the team moves beyond discovery.";

  return `${titleCase(context.processName)} is mainly slowed down by ${joinedPainPoints.toLowerCase()}. ${readinessHint}`;
}

function normalizeConfidence(
  baseConfidence: number,
  context: AssistantProcessContext
) {
  const adjustment =
    Math.min(context.painPoints.length, 3) * 2 +
    Math.min(context.applicationCount, 2) * 2 +
    Math.min(context.dataSourceCount, 2) * 3;

  return Math.min(92, Math.max(62, baseConfidence + adjustment));
}

function dedupeSuggestions(
  suggestions: AssistantSuggestion[],
  existingTitles: string[]
) {
  const existing = new Set(existingTitles.map((title) => normalizeText(title)));
  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    const key = normalizeText(suggestion.title);

    if (!key || existing.has(key) || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export const mockAssistantProvider: AssistantProvider = {
  suggestFromProcess(context) {
    const mainPainPoint = getMainPainPoint(context);
    const useCaseDefinition = getSuggestedUseCaseType(context);
    const rawSuggestions = useCaseDefinition.buildSuggestions(context, mainPainPoint);
    const opportunities = dedupeSuggestions(
      rawSuggestions.map((suggestion) => ({
        ...suggestion,
        confidence: normalizeConfidence(suggestion.confidence, context)
      })),
      context.existingOpportunityTitles ?? []
    ).slice(0, 3);

    return {
      painPointSummary: getPainPointSummary(context),
      suggestedUseCaseType: useCaseDefinition.label,
      opportunities
    } satisfies AssistantInsights;
  }
};
