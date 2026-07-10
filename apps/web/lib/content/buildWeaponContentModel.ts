import type { ItemEntry, WeaponProperty } from "@rpv/content";
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
    tItems: (key: string) => string;
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
    properties: WeaponProperty[] | undefined,
    formatters: WeaponContentFormatters
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
    slotLabel: string
): ContentSummaryModel["badges"] {
    const badges: ContentSummaryModel["badges"] = [
        { label: slotLabel, variant: "muted" },
    ];

    if (weapon.toHit) {
        badges.push({ label: weapon.toHit, variant: "muted" });
    }

    if (weapon.damage) {
        badges.push({ label: weapon.damage, variant: "muted" });
    }

    return badges;
}

export function buildWeaponContentModel(
    input: BuildWeaponContentModelInput,
    formatters: WeaponContentFormatters
): WeaponContentModels {
    const { weapon, itemEntry, slotLabel } = input;
    const weaponProfile = itemEntry?.weaponProfile;
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
            value: localizeDamageType(weaponProfile?.damageType, formatters),
        },
        {
            labelKey: "properties",
            value: localizeProperties(weaponProfile?.properties, formatters),
        },
        {
            labelKey: "versatileDamage",
            value: weaponProfile?.versatileDamageDice ?? formatters.missingValue,
        },
    ];

    const summary: ContentSummaryModel = {
        id: weapon.id,
        kind: "item",
        title: weapon.name,
        badges: buildSummaryBadges(weapon, slotLabel),
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
