/**
 * Locale primitives shared across the domain, content catalog and web app.
 *
 * Two language axes exist in the product: the UI language (a user preference)
 * and the content language (a property of each piece of content). Both reuse the
 * same {@link Locale} type and fallback rules defined here so there is a single
 * source of truth for which languages are supported.
 */

export const LOCALES = ["en", "pt-BR"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * Fallback locale used whenever a requested translation is missing. English is
 * the language the bundled SRD catalog is authored in.
 */
export const DEFAULT_LOCALE: Locale = "en";

/**
 * A value translated into one or more locales. Entries are optional because
 * content is rarely translated into every supported language at once.
 */
export type Localized<T> = Partial<Record<Locale, T>>;

export function isLocale(value: unknown): value is Locale {
    return (
        typeof value === "string" && (LOCALES as readonly string[]).includes(value)
    );
}

/**
 * Resolves a localized value, preferring the requested locale and falling back
 * to {@link DEFAULT_LOCALE} (and finally to any populated locale) so partially
 * translated content never renders blank.
 */
export function resolveLocalized<T>(
    value: Localized<T> | undefined,
    locale: Locale,
    fallback: Locale = DEFAULT_LOCALE
): T | undefined {
    if (!value) {
        return undefined;
    }

    if (value[locale] !== undefined) {
        return value[locale];
    }

    if (value[fallback] !== undefined) {
        return value[fallback];
    }

    for (const candidate of LOCALES) {
        if (value[candidate] !== undefined) {
            return value[candidate];
        }
    }

    return undefined;
}
