const REF_LABEL_PREFIX = "refs.";

function humanizeSlug(ref: string): string {
    return ref
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function formatResourceRefLabel(
    ref: string,
    t: (key: string, values?: Record<string, unknown>) => string
): string {
    const key = `${REF_LABEL_PREFIX}${ref}`;

    try {
        const translated = t(key);
        if (translated !== key) {
            return translated;
        }
    } catch {
        // next-intl throws MISSING_MESSAGE for unknown keys in strict mode.
    }

    return humanizeSlug(ref);
}
