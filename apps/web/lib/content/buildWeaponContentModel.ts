import type { ItemEntry } from "@rpv/content";
import type { WeaponAction } from "@/lib/character/combatActions";
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

function resolveUseActions(weapon: WeaponAction): ContentUseActionSpec[] {
    const actions: ContentUseActionSpec[] = [];

    if (weapon.attackModifier !== null) {
        actions.push({
            kind: "roll",
            role: "attack",
            captionKey: "toHitCaption",
            label: formatRollButtonLabel({
                primary: "d20",
                modifier: weapon.attackModifier,
            }),
        });
    }

    if (weapon.damageDice) {
        actions.push({
            kind: "roll",
            role: "damage",
            captionKey: "damageCaption",
            label: formatRollButtonLabel({
                primary: weapon.damageDice,
                modifier: weapon.damageFlat ?? 0,
            }),
        });
    }

    return actions;
}

function buildSummaryBadges(
    slotLabel: string
): ContentSummaryModel["badges"] {
    return [{ label: slotLabel, variant: "muted" }];
}

export function buildWeaponContentModel(
    input: BuildWeaponContentModelInput,
    formatters: WeaponContentFormatters
): WeaponContentModels {
    const { weapon, itemEntry, slotLabel } = input;
    const useActions = resolveUseActions(weapon);
    const useAction = useActions[0];

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
        badges: buildSummaryBadges(slotLabel),
        useAction,
        useActions: useActions.length > 0 ? useActions : undefined,
    };

    const detail: ContentDetailModel = {
        id: weapon.id,
        kind: "item",
        title: weapon.name,
        sections: [{ rows: detailRows }],
        description: itemEntry?.description ?? weapon.description,
        useAction,
        useActions: useActions.length > 0 ? useActions : undefined,
    };

    return { summary, detail };
}
