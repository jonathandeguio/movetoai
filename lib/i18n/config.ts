export const locales = ["en", "fr", "es"] as const;
export type Locale = (typeof locales)[number];
export type LocaleCodeValue = "EN" | "FR" | "ES";

export const defaultLocale: Locale = "en";
export const localeCookieName = "movetoai-locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export function toLocaleCode(locale: Locale): LocaleCodeValue {
  switch (locale) {
    case "fr":
      return "FR";
    case "es":
      return "ES";
    case "en":
    default:
      return "EN";
  }
}

export function fromLocaleCode(value?: string | null): Locale {
  const normalized = value?.toUpperCase();

  if (normalized === "FR") {
    return "fr";
  }

  if (normalized === "ES") {
    return "es";
  }

  return defaultLocale;
}

export function normalizeLocale(value?: string | null): Locale {
  const lowerValue = value?.toLowerCase();

  if (!lowerValue) {
    return defaultLocale;
  }

  if (lowerValue.startsWith("fr")) {
    return "fr";
  }

  if (lowerValue.startsWith("es")) {
    return "es";
  }

  return "en";
}
