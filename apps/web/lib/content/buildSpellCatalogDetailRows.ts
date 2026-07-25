import type { SpellCatalogEntry } from "@rpv/content";
import type { ContentDetailRow } from "./contentDetail.types";
import type { SpellContentFormatters } from "./buildSpellContentModel";

function formatSpellListSlug(slug: string): string {
    return slug
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function formatSpellComponents(entry: SpellCatalogEntry): string {
    const material = entry.material.trim();
    if (!material) {
        return entry.components;
    }

    return `${entry.components} (${material})`;
}

export function formatSpellSource(entry: SpellCatalogEntry): string | undefined {
    const parts = [entry.sourceDocumentTitle.trim(), entry.page.trim()].filter(
        Boolean
    );

    if (parts.length === 0) {
        return undefined;
    }

    return parts.join(" · ");
}

export function formatSpellLists(entry: SpellCatalogEntry): string {
    return entry.spellLists.map(formatSpellListSlug).join(", ");
}

export function buildSpellCatalogDetailRows(
    catalogEntry: SpellCatalogEntry,
    formatters: SpellContentFormatters,
    extras: ContentDetailRow[] = []
): ContentDetailRow[] {
    const yes = formatters.tContentDetail("yes");
    const no = formatters.tContentDetail("no");
    const source = formatSpellSource(catalogEntry);
    const archetype = catalogEntry.archetype.trim();

    const rows: ContentDetailRow[] = [
        ...extras,
        {
            labelKey: "range",
            value: catalogEntry.range || formatters.missingValue,
        },
        {
            labelKey: "components",
            value: formatSpellComponents(catalogEntry) || formatters.missingValue,
        },
        {
            labelKey: "concentration",
            value: catalogEntry.requiresConcentration ? yes : no,
        },
        {
            labelKey: "ritual",
            value: catalogEntry.canBeCastAsRitual ? yes : no,
        },
        {
            labelKey: "castingTime",
            value: catalogEntry.castingTime || formatters.missingValue,
        },
        {
            labelKey: "spellLists",
            value:
                formatSpellLists(catalogEntry) || formatters.missingValue,
        },
    ];

    if (archetype) {
        rows.push({
            labelKey: "archetype",
            value: archetype,
            fullWidth: true,
        });
    }

    if (source) {
        rows.push({
            labelKey: "source",
            value: source,
            fullWidth: true,
        });
    }

    return rows;
}
