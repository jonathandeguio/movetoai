import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { enMessages, type Messages } from "@/lib/i18n/en";
import { esMessages } from "@/lib/i18n/es-messages";
import { frMessages } from "@/lib/i18n/fr-messages";

const dictionaries: Record<Locale, Messages> = {
  en: enMessages,
  fr: frMessages,
  es: esMessages
};

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
