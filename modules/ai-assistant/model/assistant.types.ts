export type AssistantSuggestion = {
  title: string;
  summary: string;
  confidence: number;
};

export type AssistantPainPointInput = {
  title: string;
  description?: string | null;
  severity?: string | null;
};

export type AssistantProcessContext = {
  processName: string;
  processDescription?: string | null;
  domainName?: string | null;
  capabilityName?: string | null;
  painPoints: AssistantPainPointInput[];
  applicationCount: number;
  dataSourceCount: number;
  existingOpportunityTitles?: string[];
};

export type AssistantInsights = {
  painPointSummary: string;
  suggestedUseCaseType: string;
  opportunities: AssistantSuggestion[];
};
