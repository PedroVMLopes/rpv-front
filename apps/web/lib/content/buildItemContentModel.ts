import type { Grant, ItemEntry } from "@rpv/content";
import type {
    ContentDetailRow,
    ContentSummaryModel,
    ItemContentModels,
} from "./contentDetail.types";

export type ItemContentFormatters = {
    missingValue: string;
};

export type BuildItemContentModelInput = {
    id: string;
    itemEntry?: ItemEntry | null;
    /** Fallback title when itemEntry is missing. */
    fallbackTitle: string;
    badges?: ContentSummaryModel["badges"];
    quantity?: number;
    shortDescription?: string;
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

    if (grant.ref && signed) {
        return `${grant.ref} ${signed}`;
    }

    return grant.grantType.replace(/_/g, " ");
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

    return {
        summary: {
            id,
            kind: "item",
            title,
            badges: summaryBadges,
            shortDescription: input.shortDescription,
        },
        detail: {
            id,
            kind: "item",
            title,
            sections: [{ rows }],
            description,
            catalogGrants: grants.length > 0 ? grants : undefined,
        },
    };
}
