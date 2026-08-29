import type { SpellCatalogEntry } from "@rpv/content";
import {
    getSpellDisplayMeta,
    normalizeSpellActionCost,
} from "@rpv/content";
import type {
    ContentDetailModel,
    ContentSummaryModel,
    SpellContentModels,
} from "./contentDetail.types";
import type { SpellContentFormatters } from "./buildSpellContentModel";
import { buildSpellCatalogDetailRows, formatSpellSource } from "./buildSpellCatalogDetailRows";

function schoolToKey(school: string): string {
    return school.trim().toLowerCase().replace(/\s+/g, "_");
}

function resolveActionCost(
    catalogEntry: SpellCatalogEntry,
    formatters: SpellContentFormatters
): string {
    const displayMeta = getSpellDisplayMeta(catalogEntry.slug, catalogEntry);
    const actionCost =
        displayMeta?.actionCost ??
        normalizeSpellActionCost(catalogEntry.castingTime);

    return formatters.tSpells(`actionCost.${actionCost}`);
}

function resolveTargetLabel(
    catalogEntry: SpellCatalogEntry,
    formatters: SpellContentFormatters
): string | undefined {
    const displayMeta = getSpellDisplayMeta(catalogEntry.slug, catalogEntry);

    if (!displayMeta) {
        return undefined;
    }

    return formatters.tSpells(`target.${displayMeta.targetKind}`);
}

function resolveUsage(
    catalogEntry: SpellCatalogEntry,
    formatters: SpellContentFormatters
): string {
    const displayMeta = getSpellDisplayMeta(catalogEntry.slug, catalogEntry);
    const usage = displayMeta?.usageOverride;

    if (usage === "at_will") {
        return formatters.tSpells("usage.atWill");
    }

    if (usage === "spell_slot") {
        return formatters.tSpells("usage.spellSlotGeneric");
    }

    if (usage && typeof usage === "object" && "max" in usage) {
        return formatters.tSpells("usage.limited", {
            max: usage.max,
            period: formatters.tSpells(`usage.period.${usage.period}`),
        });
    }

    if (catalogEntry.levelInt === 0) {
        return formatters.tSpells("usage.atWill");
    }

    return formatters.tSpells("usage.spellSlot", {
        level: catalogEntry.levelInt,
    });
}

export function buildSpellPickContentModel(
    catalogEntry: SpellCatalogEntry,
    formatters: SpellContentFormatters
): SpellContentModels {
    const targetLabel = resolveTargetLabel(catalogEntry, formatters);
    const badges: ContentSummaryModel["badges"] = [];

    if (targetLabel) {
        badges.push({ label: targetLabel, variant: "muted" });
    }

    badges.push({
        label: catalogEntry.level,
        variant: "muted",
    });

    const baseRows = [
        {
            labelKey: "school",
            value: formatters.tSpells(
                `school.${schoolToKey(catalogEntry.school)}`
            ),
        },
        {
            labelKey: "level",
            value: catalogEntry.level,
        },
        {
            labelKey: "duration",
            value: catalogEntry.duration ?? formatters.missingValue,
        },
        {
            labelKey: "usage",
            value: resolveUsage(catalogEntry, formatters),
        },
        {
            labelKey: "actionCost",
            value: resolveActionCost(catalogEntry, formatters),
        },
        {
            labelKey: "target",
            value: targetLabel ?? formatters.missingValue,
        },
    ];

    const detailRows = buildSpellCatalogDetailRows(
        catalogEntry,
        formatters,
        baseRows
    );

    const shortDescription = catalogEntry.shortDescription.trim() || undefined;

    const summary: ContentSummaryModel = {
        id: catalogEntry.slug,
        kind: "spell",
        title: catalogEntry.name,
        badges,
        shortDescription,
    };

    const detail: ContentDetailModel = {
        id: catalogEntry.slug,
        kind: "spell",
        title: catalogEntry.name,
        sections: [{ rows: detailRows }],
        shortDescription,
        description: catalogEntry.description,
        higherLevel: catalogEntry.higherLevel || undefined,
        source: formatSpellSource(catalogEntry),
    };

    return { summary, detail };
}
