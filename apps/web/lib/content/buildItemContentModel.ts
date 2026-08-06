import type { ItemEntry } from "@rpv/content";
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
        },
    };
}
