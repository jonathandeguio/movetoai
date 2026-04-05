import "server-only";

import { mockAssistantProvider } from "@/modules/ai-assistant/domain/mock-provider";
import type {
  AssistantInsights,
  AssistantProcessContext
} from "@/modules/ai-assistant/model/assistant.types";

export function suggestOpportunitiesFromProcess(
  context: AssistantProcessContext
): AssistantInsights {
  return mockAssistantProvider.suggestFromProcess(context);
}
