import type { ItemEntry } from "@rpv/content";
import type { WeaponAction } from "@/lib/character/combatActions";
import { buildWeaponAttackRollRequest } from "@/lib/roll/buildRollRequest";
import { formatRollButtonLabel } from "./formatRollButtonLabel";
import type {
    ContentDetailModel,
    ContentSummaryModel,
    ContentUseActionSpec,
    WeaponContentModels,
} from "./contentDetail.types";

export type WeaponContentFormatters = {
    tItems: (
        key: string,
        values?: Record<string, string>
    ) => string;
    missingValue: string;
};

export type BuildWeaponContentModelInput = {
    weapon: WeaponAction;
    itemEntry?: ItemEntry;
    slotLabel: string;
};

function localizeDamageType(
    damageType: string | undefined,
    formatters: WeaponContentFormatters
): string {
    if (!damageType) {
        return formatters.missingValue;
    }

    const key = `damageType.${damageType}`;
    const localized = formatters.tItems(key);

    return localized === key ? damageType : localized;
}

function localizeProperties(
    item: ItemEntry | undefined,
    formatters: WeaponContentFormatters
): string {
    const properties = item?.weapon?.properties;
    if (!properties || properties.length === 0) {
        return formatters.missingValue;
    }

    return properties
        .map((property) => {
            const propKey = property.name.toLowerCase().replace(/\s+/g, "-");
            const key = `properties.${propKey}`;
            try {
                const localized = formatters.tItems(key);
                return localized === key ? property.name : localized;
            } catch {
                return property.name;
            }
        })
        .join(", ");
}

function versatileDamage(item: ItemEntry | undefined): string | undefined {
    const versatile = item?.weapon?.properties.find(
        (property) => property.name.toLowerCase() === "versatile"
    );
    return versatile?.detail ?? undefined;
}

function resolveUseActionSpec(
    weapon: WeaponAction
): ContentUseActionSpec | undefined {
    if (!buildWeaponAttackRollRequest(weapon)) {
        return undefined;
    }

    return {
        kind: "roll",
        label: formatRollButtonLabel({
            primary: "d20",
            modifier: weapon.attackModifier,
        }),
    };
}

function buildSummaryBadges(
    weapon: WeaponAction,
    slotLabel: string,
    formatters: WeaponContentFormatters
): ContentSummaryModel["badges"] {
    const badges: ContentSummaryModel["badges"] = [];

    if (weapon.damage) {
        badges.push({
            label: formatters.tItems("summary.damage", {
                damage: weapon.damage,
            }),
            variant: "muted",
        });
    }

    badges.push({ label: slotLabel, variant: "muted" });

    return badges;
}

export function buildWeaponContentModel(
    input: BuildWeaponContentModelInput,
    formatters: WeaponContentFormatters
): WeaponContentModels {
    const { weapon, itemEntry, slotLabel } = input;
    const useAction = resolveUseActionSpec(weapon);

    const detailRows = [
        {
            labelKey: "slot",
            value: slotLabel,
        },
        {
            labelKey: "attackBonus",
            value: weapon.toHit ?? formatters.missingValue,
        },
        {
            labelKey: "damage",
            value: weapon.damage ?? formatters.missingValue,
        },
        {
            labelKey: "damageType",
            value: localizeDamageType(
                itemEntry?.weapon?.damageType.key,
                formatters
            ),
        },
        {
            labelKey: "properties",
            value: localizeProperties(itemEntry, formatters),
        },
        {
            labelKey: "versatileDamage",
            value: versatileDamage(itemEntry) ?? formatters.missingValue,
        },
    ];

    const summary: ContentSummaryModel = {
        id: weapon.id,
        kind: "item",
        title: weapon.name,
        badges: buildSummaryBadges(weapon, slotLabel, formatters),
        useAction,
    };

    const detail: ContentDetailModel = {
        id: weapon.id,
        kind: "item",
        title: weapon.name,
        sections: [{ rows: detailRows }],
        description: itemEntry?.description ?? weapon.description,
        useAction,
    };

    return { summary, detail };
}
