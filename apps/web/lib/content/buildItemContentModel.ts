import type { Grant, ItemEntry } from "@rpv/content";
import { listItemUseGrants } from "@rpv/content";
import type { SpellAction } from "@/lib/character/combatActions";
import type { SpellCatalogEntry } from "@rpv/content";
import {
    resolveSpellUseActions,
    type SpellContentFormatters,
} from "./buildSpellContentModel";
import type {
    ContentDetailRow,
    ContentSummaryModel,
    ContentUseActionSpec,
    ItemContentModels,
} from "./contentDetail.types";

export type ItemContentFormatters = {
    missingValue: string;
    /** Required to emit cast_spell useActions on consumables. */
    spell?: SpellContentFormatters;
    /** Label for drink/use on heal and stub consumables. */
    useLabel?: string;
};

export type BuildItemContentModelInput = {
    id: string;
    itemEntry?: ItemEntry | null;
    /** Fallback title when itemEntry is missing. */
    fallbackTitle: string;
    badges?: ContentSummaryModel["badges"];
    quantity?: number;
    shortDescription?: string;
    /**
     * When the item is a cast_spell consumable, pass the derived SpellAction
     * (and optional catalog entry) so useActions match known spells.
     */
    consumableSpell?: {
        spell: SpellAction;
        catalogEntry?: SpellCatalogEntry;
        depleted?: boolean;
    };
    /** Non-spell consumable (heal / apply_condition / deal_damage). */
    consumableUse?: {
        depleted?: boolean;
        label?: string;
    };
};

function formatWeight(item: ItemEntry | undefined | null): string | undefined {
    if (!item?.weight) {
        return undefined;
    }
    return item.weightUnit
        ? `${item.weight} ${item.weightUnit}`
        : item.weight;
}

function formatGrantLine(grant: Grant): string {
    if (grant.description?.trim()) {
        return grant.description.trim();
    }

    const signed =
        grant.amount !== undefined
            ? `${grant.amount > 0 ? "+" : ""}${grant.amount}`
            : undefined;

    if (
        (grant.grantType === "stat_modifier" ||
            grant.grantType === "ability_score") &&
        grant.targetStat
    ) {
        return signed
            ? `${grant.targetStat} ${signed}`
            : grant.targetStat;
    }

    if (grant.grantType === "spell") {
        const refs = [
            grant.ref,
            ...(grant.options ?? [])
                .filter((option) => option.optionType === "spell")
                .map((option) => option.ref),
        ].filter((ref): ref is string => Boolean(ref));
        if (refs.length > 0) {
            return refs.join(", ");
        }
    }

    if (grant.useEffect?.kind === "cast_spell") {
        return grant.useEffect.spellRef;
    }

    if (grant.useEffect?.kind === "heal") {
        const flat =
            grant.useEffect.flat != null ? ` + ${grant.useEffect.flat}` : "";
        return `${grant.useEffect.dice}${flat}`;
    }

    if (grant.useEffect?.kind === "apply_condition") {
        return grant.useEffect.conditionRef;
    }

    if (grant.useEffect?.kind === "deal_damage") {
        return `${grant.useEffect.dice} ${grant.useEffect.damageType}`;
    }

    if (grant.ref && signed) {
        return `${grant.ref} ${signed}`;
    }

    return grant.grantType.replace(/_/g, " ");
}

function markDepleted(
    actions: ContentUseActionSpec[] | undefined,
    depleted: boolean
): ContentUseActionSpec[] | undefined {
    if (!actions) {
        return undefined;
    }
    return actions.map((action) =>
        depleted ? { ...action, disabled: true } : action
    );
}

function resolveConsumableUseActions(
    input: BuildItemContentModelInput,
    formatters: ItemContentFormatters
): {
    useAction?: ContentUseActionSpec;
    useActions?: ContentUseActionSpec[];
} {
    const item = input.itemEntry;
    if (!item) {
        return {};
    }

    const useGrants = listItemUseGrants(item);
    if (useGrants.length === 0) {
        return {};
    }

    if (input.consumableSpell && formatters.spell) {
        const { useAction, useActions } = resolveSpellUseActions(
            input.consumableSpell.spell,
            input.consumableSpell.catalogEntry,
            formatters.spell
        );

        const depleted = Boolean(input.consumableSpell.depleted);
        const nextActions = markDepleted(useActions, depleted);
        const nextAction = useAction
            ? depleted
                ? { ...useAction, disabled: true }
                : useAction
            : undefined;

        return {
            useAction: nextAction,
            useActions: nextActions,
        };
    }

    if (input.consumableUse) {
        const depleted = Boolean(input.consumableUse.depleted);
        const label =
            input.consumableUse.label ?? formatters.useLabel ?? "Use";
        const useAction: ContentUseActionSpec = {
            kind: "cast",
            label,
            disabled: depleted || undefined,
        };
        return { useAction, useActions: [useAction] };
    }

    return {};
}

export function buildItemContentModel(
    input: BuildItemContentModelInput,
    formatters: ItemContentFormatters
): ItemContentModels {
    const { id, itemEntry, fallbackTitle, badges = [], quantity } = input;
    const title = itemEntry?.name ?? fallbackTitle;
    const description = itemEntry?.description || undefined;

    const rows: ContentDetailRow[] = [
        {
            labelKey: "category",
            value: itemEntry?.category?.name ?? formatters.missingValue,
        },
        {
            labelKey: "weight",
            value: formatWeight(itemEntry) ?? formatters.missingValue,
        },
        {
            labelKey: "cost",
            value: itemEntry?.cost ?? formatters.missingValue,
        },
    ];

    if (quantity !== undefined) {
        rows.push({
            labelKey: "quantity",
            value: String(quantity),
            quantityControls: true,
        });
    }

    const grants = itemEntry?.grants ?? [];
    if (grants.length > 0) {
        rows.push({
            labelKey: "grants",
            value: grants.map(formatGrantLine).join("\n"),
            fullWidth: true,
        });
    }

    const summaryBadges =
        badges.length > 0
            ? badges
            : itemEntry?.category?.name
              ? [{ label: itemEntry.category.name, variant: "muted" as const }]
              : [];

    const { useAction, useActions } = resolveConsumableUseActions(
        input,
        formatters
    );

    return {
        summary: {
            id,
            kind: "item",
            title,
            badges: summaryBadges,
            shortDescription: input.shortDescription,
            useAction,
            useActions,
        },
        detail: {
            id,
            kind: "item",
            title,
            sections: [{ rows }],
            description,
            catalogGrants: grants.length > 0 ? grants : undefined,
            useAction,
            useActions,
        },
    };
}
