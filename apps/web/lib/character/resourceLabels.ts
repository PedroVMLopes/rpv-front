const REF_LABEL_PREFIX = "refs.";

function humanizeSlug(ref: string): string {
    return ref
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function formatResourceRefLabel(
    ref: string,
    t: (key: string, values?: Record<string, unknown>) => string,
    /** Prefer `t.has` from next-intl — avoids MISSING_MESSAGE side effects. */
    hasKey?: (key: string) => boolean
): string {
    const key = `${REF_LABEL_PREFIX}${ref}`;

    if (hasKey && !hasKey(key)) {
        return humanizeSlug(ref);
    }

    try {
        const translated = t(key);
        if (translated !== key) {
            return translated;
        }
    } catch {
        // next-intl may still throw MISSING_MESSAGE for unknown keys in strict mode.
    }

    return humanizeSlug(ref);
}
