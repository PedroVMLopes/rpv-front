import type { Locale } from "@rpv/domain";
import enMessages from "@/messages/en.json";
import ptBRMessages from "@/messages/pt-BR.json";

const defaultNames: Record<Locale, string> = {
    en: enMessages.character.defaultName,
    "pt-BR": ptBRMessages.character.defaultName,
};

export function getDefaultCharacterName(locale: Locale): string {
    return defaultNames[locale] ?? defaultNames.en;
}

export function resolveCharacterNameForSave(
    rawName: unknown,
    locale: Locale
): string {
    if (typeof rawName !== "string") {
        return getDefaultCharacterName(locale);
    }

    const trimmed = rawName.trim();
    return trimmed.length > 0 ? trimmed : getDefaultCharacterName(locale);
}

export function isCharacterNamePending(
    rawName: unknown,
    locale: Locale
): boolean {
    if (typeof rawName !== "string") {
        return true;
    }

    const trimmed = rawName.trim();
    if (trimmed.length === 0) {
        return true;
    }

    return trimmed === getDefaultCharacterName(locale);
}
