import type { Grant, GrantOption, ItemEntry, WeaponProperty } from "@rpv/content";
import {
    flattenGrantOptionToEntries,
    formatInventoryBundleLabel,
    getItem,
} from "@rpv/content";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import type {
    ContentDetailModel,
    ContentDetailRow,
    ContentSummaryModel,
} from "./contentDetail.types";

export type ItemPickContentFormatters = {
    tItems: (key: string, values?: Record<string, string | number>) => string;
    tContentDetail: (key: string) => string;
    missingValue: string;
    slotLabel?: (slotId: string) => string;
};

export type ItemPickContentModels = {
    summary: ContentSummaryModel;
    detail: ContentDetailModel;
};

function localizeDamageType(
    damageType: string | undefined,
    formatters: ItemPickContentFormatters
): string {
    if (!damageType) {
        return formatters.missingValue;
    }

    const key = `damageType.${damageType}`;
    const localized = formatters.tItems(key);

    return localized === key ? damageType : localized;
}

function localizeProperties(
    properties: WeaponProperty[] | undefined,
    formatters: ItemPickContentFormatters
): string {
    if (!properties || properties.length === 0) {
        return formatters.missingValue;
    }

    return properties
        .map((property) => {
            const key = `properties.${property}`;
            const localized = formatters.tItems(key);

            return localized === key ? property : localized;
        })
        .join(", ");
}

function formatGrantLine(grant: Grant, formatters: ItemPickContentFormatters): string {
    if (grant.description?.trim()) {
        return grant.description.trim();
    }

    if (grant.grantType === "stat_modifier" && grant.targetStat) {
        const amount = grant.amount ?? 0;
        const signed = amount >= 0 ? `+${amount}` : String(amount);
        return `${signed} ${grant.targetStat}`;
    }

    if (grant.grantType === "spell") {
        const refs = grant.options
            ?.filter((option) => option.optionType === "spell")
            .map((option) => option.ref)
            .join(", ");
        return refs ? `Spell: ${refs}` : "Spell";
    }

    if (grant.grantType === "ability") {
        return grant.description?.trim() || "Ability";
    }

    return formatters.tItems("pick.grantFallback", {
        type: grant.grantType,
    });
}

function formatSlots(
    allowedSlots: string[] | undefined,
    formatters: ItemPickContentFormatters
): string {
    if (!allowedSlots || allowedSlots.length === 0) {
        return formatters.missingValue;
    }

    return allowedSlots
        .map((slotId) => formatters.slotLabel?.(slotId) ?? slotId)
        .join(", ");
}

export function buildItemPickContentModel(
    item: ItemEntry,
    formatters: ItemPickContentFormatters
): ItemPickContentModels {
    const badges: ContentSummaryModel["badges"] = [];
    const profile = item.weaponProfile;

    if (item.category) {
        badges.push({ label: item.category, variant: "muted" });
    }

    if (profile?.damageDice) {
        const damageType = localizeDamageType(profile.damageType, formatters);
        badges.push({
            label: `${profile.damageDice} ${damageType}`,
            variant: "muted",
        });
    }

    if (profile?.properties && profile.properties.length > 0) {
        badges.push({
            label: localizeProperties(profile.properties, formatters),
            variant: "muted",
        });
    }

    const detailRows: ContentDetailRow[] = [
        {
            labelKey: "slot",
            value: formatSlots(item.allowedSlots, formatters),
        },
    ];

    if (profile) {
        detailRows.push(
            {
                labelKey: "damage",
                value: profile.damageDice,
            },
            {
                labelKey: "damageType",
                value: localizeDamageType(profile.damageType, formatters),
            },
            {
                labelKey: "properties",
                value: localizeProperties(profile.properties, formatters),
            },
            {
                labelKey: "versatileDamage",
                value: profile.versatileDamageDice ?? formatters.missingValue,
            }
        );
    }

    if (item.grants.length > 0) {
        detailRows.push({
            labelKey: "grants",
            value: item.grants
                .map((grant) => formatGrantLine(grant, formatters))
                .join("; "),
        });
    }

    return {
        summary: {
            id: item.slug,
            kind: "item",
            title: item.name,
            badges,
        },
        detail: {
            id: item.slug,
            kind: "item",
            title: item.name,
            sections: [{ rows: detailRows }],
            description: item.description,
            catalogGrants: item.grants.length > 0 ? item.grants : undefined,
        },
    };
}

export type BundlePickInput = {
    option: Extract<GrantOption, { optionType: "inventory_bundle" }>;
    optionIndex: number;
    system: SystemKey;
    locale: Locale;
};

export function buildBundlePickContentModel(
    input: BundlePickInput,
    formatters: ItemPickContentFormatters
): ItemPickContentModels {
    const { option, optionIndex, system, locale } = input;
    const title = formatInventoryBundleLabel(option, system, locale);
    const entries = flattenGrantOptionToEntries(option);

    const componentLines = entries.map(({ slug, quantity }) => {
        const item = getItem(slug, system, locale);
        const name = item?.name ?? slug;
        return quantity > 1 ? `${name} ×${quantity}` : name;
    });

    const badges: ContentSummaryModel["badges"] = [
        {
            label: formatters.tItems("pick.bundleBadge"),
            variant: "muted",
        },
    ];

    if (entries.length > 0) {
        badges.push({
            label: formatters.tItems("pick.bundleItemCount", {
                count: entries.length,
            }),
            variant: "muted",
        });
    }

    return {
        summary: {
            id: `bundle-${optionIndex}`,
            kind: "item",
            title,
            badges,
        },
        detail: {
            id: `bundle-${optionIndex}`,
            kind: "item",
            title,
            sections: [
                {
                    rows: [
                        {
                            labelKey: "contents",
                            value:
                                componentLines.length > 0
                                    ? componentLines.join(", ")
                                    : formatters.missingValue,
                        },
                    ],
                },
            ],
            description:
                componentLines.length > 0
                    ? componentLines.join("\n")
                    : undefined,
        },
    };
}
