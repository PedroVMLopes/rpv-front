import type { Locale, Stats } from "@rpv/domain";
import {
    getAbilityFeatureDescription,
    getFeatureActionMeta,
    getItem,
    getSpellDisplayMeta,
    normalizeSpellActionCost,
} from "@rpv/content";
import { contentRepo } from "@/lib/content/contentRepository";
import { getCharacterWalkSpeed } from "@/lib/character/characterSpeed";
import { computeInitiative } from "@/lib/character/derivedStats";
import { listCombatResources } from "@/lib/character/combatResources";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    listEquippedWeaponActions,
    listSpellActions,
} from "@/lib/character/combatActions";
import {
    buildSpellAttackRollRequest,
    buildSpellDamageRollRequest,
    buildWeaponAttackRollRequest,
} from "@/lib/roll/buildRollRequest";
import type { RollRequest } from "@/lib/roll/rollRequest.types";

export type ActionSourceType = "weapon" | "spell" | "feature" | "item";

export type ActionCost =
    | "action"
    | "bonus"
    | "reaction"
    | "special"
    | "passive";

export type ActionAvailability =
    | "available"
    | "depleted"
    | "unavailable"
    | "unequipped"
    | "unprepared";

export type ActionFilterId =
    | "all"
    | "weapons"
    | "spells"
    | "features"
    | "available";

export type DisplayAction = {
    id: string;
    title: string;
    sourceType: ActionSourceType;
    actionCost: ActionCost;
    availability: ActionAvailability;
    badges: string[];
    summary: string[];
    description?: string;
    rollRequest?: RollRequest;
    actionLabel: "roll" | "use";
    resource?: {
        ref: string;
        label: string;
        current?: number;
        max?: number;
    };
    stateTags?: string[];
    tags?: string[];
};

export type ActionsStatusSummary = {
    currentHp: number;
    maxHp: number;
    armorClass: number;
    initiative: number;
    walkSpeed?: number;
    resources: Array<{
        ref: string;
        label: string;
        current: number;
        max: number;
    }>;
};

export type DisplayActionGroup = {
    cost: ActionCost;
    actions: DisplayAction[];
};

function slotLabel(slotId: string, tSlots: (key: string) => string): string {
    switch (slotId) {
        case "melee-main":
            return tSlots("meleeMain");
        case "melee-off":
            return tSlots("meleeOff");
        case "ranged-main":
            return tSlots("rangedMain");
        case "ranged-off":
            return tSlots("rangedOff");
        default:
            return slotId;
    }
}

function displayActionCost(kind: string | undefined): ActionCost {
    switch (kind) {
        case "bonus_action":
            return "bonus";
        case "reaction":
            return "reaction";
        case "special":
        case "minute":
        case "hour":
            return "special";
        case "action":
        default:
            return "action";
    }
}

function buildWeaponActions(
    stored: StoredCharacter,
    resolved: Stats,
    locale: Locale | undefined,
    tSlots: (key: string) => string
): DisplayAction[] {
    return listEquippedWeaponActions(stored, resolved, locale).map((weapon) => {
        const item = getItem(weapon.slug, stored.system, locale);
        const rangeSummary =
            item?.weapon?.range != null
                ? item.weapon.longRange != null
                    ? `${item.weapon.range}/${item.weapon.longRange} ${item.weapon.distanceUnit ?? ""}`.trim()
                    : `${item.weapon.range} ${item.weapon.distanceUnit ?? ""}`.trim()
                : null;

        return {
            id: weapon.id,
            title: weapon.name,
            sourceType: "weapon",
            actionCost: "action",
            availability: "available",
            badges: [slotLabel(weapon.slotId, tSlots)],
            summary: [weapon.toHit, weapon.damage, rangeSummary].filter(
                Boolean
            ) as string[],
            description: weapon.description,
            rollRequest: buildWeaponAttackRollRequest(weapon) ?? undefined,
            actionLabel: "roll",
            tags: [
                "weapon",
                weapon.slotId.startsWith("ranged") ? "ranged" : "melee",
            ],
        };
    });
}

function buildSpellActions(
    stored: StoredCharacter,
    resolved: Stats,
    locale: Locale | undefined
): DisplayAction[] {
    const prepared = new Set(stored.selections.choices.preparedSpells ?? []);
    const { cantrips, spells } = listSpellActions(stored, resolved, locale);

    return [...cantrips, ...spells].map((spell) => {
        const entry = contentRepo(stored.system).getSpell(spell.slug, locale);
        const displayMeta = getSpellDisplayMeta(spell.slug);
        const actionCost = displayActionCost(
            displayMeta?.actionCost ??
                (entry ? normalizeSpellActionCost(entry.castingTime) : undefined)
        );
        const isPrepared = prepared.has(spell.slug);
        const resource =
            entry?.levelInt && entry.levelInt > 0
                ? {
                      ref: `spell-slots-${entry.levelInt}`,
                      label: `Lv${entry.levelInt}`,
                  }
                : undefined;

        return {
            id: spell.id,
            title: spell.name,
            sourceType: "spell",
            actionCost,
            availability: "available",
            badges: [
                entry?.levelInt === 0
                    ? "Cantrip"
                    : entry?.levelInt != null
                      ? `Lv${entry.levelInt}`
                      : "Spell",
            ],
            summary: [
                spell.attackBonus,
                spell.saveDc,
                entry?.range,
                entry?.requiresConcentration ? "Concentration" : null,
            ].filter(Boolean) as string[],
            description: spell.description,
            rollRequest:
                buildSpellAttackRollRequest(spell) ??
                buildSpellDamageRollRequest(spell) ??
                undefined,
            actionLabel:
                buildSpellAttackRollRequest(spell) ||
                buildSpellDamageRollRequest(spell)
                    ? "roll"
                    : "use",
            resource,
            stateTags: [
                isPrepared ? "Prepared" : null,
                entry?.requiresConcentration ? "Concentration" : null,
            ].filter(Boolean) as string[],
            tags: ["spell", entry?.levelInt === 0 ? "cantrip" : "leveled"],
        };
    });
}

function buildFeatureActions(
    stored: StoredCharacter,
    locale: Locale | undefined
): DisplayAction[] {
    const resourceEntries = listCombatResources(stored.grants ?? [], stored.resources);
    const resourceByRef = new Map(resourceEntries.map((entry) => [entry.ref, entry]));

    return (stored.grants ?? [])
        .filter((grant) => grant.kind === "ability")
        .map((grant) => {
            const title = grant.name ?? grant.ref;
            const meta = getFeatureActionMeta(title);
            const resourceEntry = meta?.resourceRef
                ? resourceByRef.get(meta.resourceRef)
                : undefined;
            const sourceType = grant.source.type === "item" ? "item" : "feature";

            return {
                id: grant.id,
                title,
                sourceType,
                actionCost: meta?.actionCost ?? "special",
                availability:
                    resourceEntry && resourceEntry.current <= 0
                        ? "depleted"
                        : "available",
                badges: [],
                summary: [
                    resourceEntry
                        ? `${resourceEntry.current}/${resourceEntry.max}`
                        : null,
                ].filter(Boolean) as string[],
                description: getAbilityFeatureDescription(
                    title,
                    grant.source,
                    locale
                ),
                actionLabel: "use",
                resource: resourceEntry
                    ? {
                          ref: resourceEntry.ref,
                          label:
                              resourceEntry.spellLevel !== undefined
                                  ? `Lv${resourceEntry.spellLevel}`
                                  : formatResourceRefLabel(
                                        resourceEntry.ref,
                                        (key) => key
                                    ),
                          current: resourceEntry.current,
                          max: resourceEntry.max,
                      }
                    : undefined,
                stateTags:
                    meta?.actionCost === "passive" ? ["Passive"] : undefined,
                tags: meta?.tags,
            };
        });
}

export function buildDisplayActions(
    stored: StoredCharacter,
    resolved: Stats,
    locale: Locale | undefined,
    tSlots: (key: string) => string
): DisplayAction[] {
    const resourceEntries = listCombatResources(stored.grants ?? [], stored.resources);
    const featureResources = new Map(resourceEntries.map((entry) => [entry.ref, entry]));

    return [
        ...buildWeaponActions(stored, resolved, locale, tSlots),
        ...buildSpellActions(stored, resolved, locale).map((action) => ({
            ...action,
            resource:
                action.resource && featureResources.has(action.resource.ref)
                    ? {
                          ...action.resource,
                          current: featureResources.get(action.resource.ref)?.current,
                          max: featureResources.get(action.resource.ref)?.max,
                      }
                    : action.resource,
        })),
        ...buildFeatureActions(stored, locale),
    ];
}

export function filterDisplayActions(
    actions: DisplayAction[],
    filter: ActionFilterId
): DisplayAction[] {
    switch (filter) {
        case "weapons":
            return actions.filter((action) => action.sourceType === "weapon");
        case "spells":
            return actions.filter((action) => action.sourceType === "spell");
        case "features":
            return actions.filter(
                (action) =>
                    action.sourceType === "feature" || action.sourceType === "item"
            );
        case "available":
            return actions.filter((action) => action.availability === "available");
        case "all":
        default:
            return actions;
    }
}

const ACTION_COST_ORDER: ActionCost[] = [
    "action",
    "bonus",
    "reaction",
    "special",
    "passive",
];

export function groupDisplayActions(actions: DisplayAction[]): DisplayActionGroup[] {
    return ACTION_COST_ORDER.map((cost) => ({
        cost,
        actions: actions.filter((action) => action.actionCost === cost),
    })).filter((group) => group.actions.length > 0);
}

export function buildActionsStatusSummary(
    stored: StoredCharacter,
    resolved: Stats,
    locale: Locale | undefined,
    currentHp: number
): ActionsStatusSummary {
    const resources = listCombatResources(stored.grants ?? [], stored.resources).map(
        (entry) => ({
            ref: entry.ref,
            label:
                entry.spellLevel !== undefined
                    ? `Lv${entry.spellLevel}`
                    : formatResourceRefLabel(entry.ref, (key) => key),
            current: entry.current,
            max: entry.max,
        })
    );

    return {
        currentHp,
        maxHp: resolved.hitPoints,
        armorClass: resolved.armorClass,
        initiative: computeInitiative(stored.system, resolved),
        walkSpeed: getCharacterWalkSpeed(stored.selections, locale),
        resources,
    };
}
