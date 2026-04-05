import type {
  AssistantInsights,
  AssistantProcessContext
} from "@/modules/ai-assistant/model/assistant.types";

export type AssistantProvider = {
  suggestFromProcess(context: AssistantProcessContext): AssistantInsights;
};
