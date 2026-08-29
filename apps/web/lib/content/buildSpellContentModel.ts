import type { SpellCatalogEntry, SpellRollProfile, SpellUsageKind } from "@rpv/content";
import {
    getSpellDisplayMeta,
    getSpellRollUseLabel,
    normalizeSpellActionCost,
} from "@rpv/content";
import type { StatKey } from "@rpv/domain";
import type { SpellAction } from "@/lib/character/combatActions";
import {
    hasSpellRollAction,
} from "@/lib/roll/buildRollRequest";
import { formatRollButtonLabel } from "./formatRollButtonLabel";
import { buildSpellCatalogDetailRows, formatSpellSource } from "./buildSpellCatalogDetailRows";
import type {
    ContentDetailModel,
    ContentSummaryModel,
    ContentUseActionSpec,
    SpellContentModels,
} from "./contentDetail.types";

export type SpellContentFormatters = {
    tSpells: (
        key: string,
        values?: Record<string, string | number>
    ) => string;
    tAbilities: (key: StatKey) => string;
    tContentDetail: (key: string) => string;
    tUse: () => string;
    tRitual: () => string;
    missingValue: string;
};

export type BuildSpellContentModelInput = {
    spell: SpellAction;
    catalogEntry?: SpellCatalogEntry;
    spellcastingAbility?: StatKey | null;
    concentrating?: boolean;
};

function schoolToKey(school: string): string {
    return school.trim().toLowerCase().replace(/\s+/g, "_");
}

function resolveSpellUsage(
    spell: SpellAction,
    catalogEntry: SpellCatalogEntry | undefined,
    formatters: SpellContentFormatters
): string {
    const displayMeta = getSpellDisplayMeta(spell.slug, catalogEntry);
    const usage = displayMeta?.usageOverride;

    if (usage) {
        return formatUsageKind(usage, formatters);
    }

    const levelInt = catalogEntry?.levelInt ?? spell.levelInt;

    if (levelInt === 0 || levelInt === null) {
        return formatters.tSpells("usage.atWill");
    }

    return formatters.tSpells("usage.spellSlot", { level: levelInt });
}

function formatUsageKind(
    usage: SpellUsageKind,
    formatters: SpellContentFormatters
): string {
    if (usage === "at_will") {
        return formatters.tSpells("usage.atWill");
    }

    if (usage === "spell_slot") {
        return formatters.tSpells("usage.spellSlotGeneric");
    }

    return formatters.tSpells("usage.limited", {
        max: usage.max,
        period: formatters.tSpells(`usage.period.${usage.period}`),
    });
}

function resolveSpellAbility(
    spell: SpellAction,
    spellcastingAbility: StatKey | null | undefined,
    formatters: SpellContentFormatters
): string {
    if (spell.rollProfile?.mode === "save") {
        return formatters.tAbilities(spell.rollProfile.saveAbility);
    }

    if (spellcastingAbility) {
        return formatters.tAbilities(spellcastingAbility);
    }

    return formatters.missingValue;
}

function resolveActionCost(
    catalogEntry: SpellCatalogEntry | undefined,
    formatters: SpellContentFormatters
): string {
    const displayMeta = catalogEntry
        ? getSpellDisplayMeta(catalogEntry.slug, catalogEntry)
        : undefined;
    const actionCost =
        displayMeta?.actionCost ??
        (catalogEntry
            ? normalizeSpellActionCost(catalogEntry.castingTime)
            : "special");

    return formatters.tSpells(`actionCost.${actionCost}`);
}

function resolveTargetLabel(
    spell: SpellAction,
    catalogEntry: SpellCatalogEntry | undefined,
    formatters: SpellContentFormatters
): string | undefined {
    const displayMeta = getSpellDisplayMeta(spell.slug, catalogEntry);

    if (!displayMeta) {
        return undefined;
    }

    return formatters.tSpells(`target.${displayMeta.targetKind}`);
}

function resolveSpellDamageButtonLabel(profile: SpellRollProfile): string {
    return formatRollButtonLabel({
        primary: getSpellRollUseLabel(profile),
        modifier: null,
    });
}

function appendRitualAction(
    result: {
        useAction?: ContentUseActionSpec;
        useActions?: ContentUseActionSpec[];
    },
    catalogEntry: SpellCatalogEntry | undefined,
    formatters: SpellContentFormatters
): {
    useAction?: ContentUseActionSpec;
    useActions?: ContentUseActionSpec[];
} {
    if (!catalogEntry?.canBeCastAsRitual) {
        return result;
    }

    const ritual: ContentUseActionSpec = {
        kind: "cast",
        role: "ritual",
        label: formatters.tRitual(),
    };
    const existing =
        result.useActions && result.useActions.length > 0
            ? result.useActions
            : result.useAction
              ? [result.useAction]
              : [];
    const next = [...existing, ritual];

    return {
        useAction: next[0],
        useActions: next,
    };
}

function resolvePrimaryUseActions(
    spell: SpellAction,
    catalogEntry: SpellCatalogEntry | undefined,
    formatters: SpellContentFormatters
): {
    useAction?: ContentUseActionSpec;
    useActions?: ContentUseActionSpec[];
} {
    const profile = spell.rollProfile;

    if (profile?.mode === "attack") {
        const actions: ContentUseActionSpec[] = [];

        if (spell.attackModifier !== null) {
            actions.push({
                kind: "roll",
                role: "attack",
                captionKey: "toHitCaption",
                label: formatRollButtonLabel({
                    primary: "d20",
                    modifier: spell.attackModifier,
                }),
            });
        }

        actions.push({
            kind: "roll",
            role: "damage",
            captionKey: "damageCaption",
            label: resolveSpellDamageButtonLabel(profile),
        });

        return {
            useAction: actions[0],
            useActions: actions,
        };
    }

    if (
        profile &&
        (profile.mode === "save" || profile.mode === "damage_only") &&
        hasSpellRollAction(spell)
    ) {
        const action: ContentUseActionSpec = {
            kind: "roll",
            captionKey: "damageCaption",
            label: resolveSpellDamageButtonLabel(profile),
        };
        return {
            useAction: action,
            useActions: [action],
        };
    }

    return {
        useAction: {
            kind: "cast",
            label: formatters.tUse(),
        },
    };
}

function resolveUseActions(
    spell: SpellAction,
    catalogEntry: SpellCatalogEntry | undefined,
    formatters: SpellContentFormatters
): {
    useAction?: ContentUseActionSpec;
    useActions?: ContentUseActionSpec[];
} {
    return appendRitualAction(
        resolvePrimaryUseActions(spell, catalogEntry, formatters),
        catalogEntry,
        formatters
    );
}

export function buildSpellContentModel(
    input: BuildSpellContentModelInput,
    formatters: SpellContentFormatters
): SpellContentModels {
    const { spell, catalogEntry, spellcastingAbility, concentrating } = input;
    const { useAction, useActions } = resolveUseActions(
        spell,
        catalogEntry,
        formatters
    );
    const targetLabel = resolveTargetLabel(spell, catalogEntry, formatters);

    const badges: ContentSummaryModel["badges"] = [];

    if (targetLabel) {
        badges.push({ label: targetLabel, variant: "muted" });
    }

    if (catalogEntry?.requiresConcentration) {
        badges.push({
            label: concentrating
                ? formatters.tSpells("badge.concentrating")
                : formatters.tSpells("badge.concentration"),
            variant: concentrating ? "default" : "muted",
        });
    }

    if (catalogEntry?.canBeCastAsRitual) {
        badges.push({
            label: formatters.tSpells("badge.ritual"),
            variant: "muted",
        });
    }

    const baseRows = [
        {
            labelKey: "school",
            value: catalogEntry
                ? formatters.tSpells(
                      `school.${schoolToKey(catalogEntry.school)}`
                  )
                : formatters.missingValue,
        },
        {
            labelKey: "level",
            value:
                catalogEntry?.level ??
                (spell.levelInt !== null
                    ? String(spell.levelInt)
                    : formatters.missingValue),
        },
        {
            labelKey: "duration",
            value: catalogEntry?.duration ?? formatters.missingValue,
        },
        {
            labelKey: "usage",
            value: resolveSpellUsage(spell, catalogEntry, formatters),
        },
        {
            labelKey: "ability",
            value: resolveSpellAbility(spell, spellcastingAbility, formatters),
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

    const detailRows = catalogEntry
        ? buildSpellCatalogDetailRows(catalogEntry, formatters, baseRows)
        : baseRows;

    const shortDescription = catalogEntry?.shortDescription.trim() || undefined;
    const source = catalogEntry
        ? formatSpellSource(catalogEntry)
        : undefined;

    const summary: ContentSummaryModel = {
        id: spell.id,
        kind: "spell",
        title: spell.name,
        badges,
        shortDescription,
        useAction,
        useActions,
    };

    const detail: ContentDetailModel = {
        id: spell.id,
        kind: "spell",
        title: spell.name,
        sections: [{ rows: detailRows }],
        shortDescription,
        description: catalogEntry?.description ?? spell.description,
        higherLevel: catalogEntry?.higherLevel || undefined,
        source,
        useAction,
        useActions,
    };

    return { summary, detail };
}
