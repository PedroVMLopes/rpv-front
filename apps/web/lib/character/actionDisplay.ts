import type {
    CharacterGrant,
    GrantActivation,
    Locale,
    ModifierSourceType,
    Stats,
} from "@rpv/domain";
import {
    getAbilityFeatureDescription,
    getAbilityFeatureName,
    getItem,
    getSpellDisplayMeta,
    normalizeSpellActionCost,
} from "@rpv/content";
import { contentRepo } from "@/lib/content/contentRepository";
import { getCharacterWalkSpeed } from "@/lib/character/characterSpeed";
import { computeInitiative } from "@/lib/character/derivedStats";
import { listCombatResources, type CombatResourceEntry } from "@/lib/character/combatResources";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    listEquippedWeaponActions,
    listNaturalWeaponActions,
    listSpellActions,
    type SpellAction,
    type WeaponAction,
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

export type ActionFilterCategory =
    | "weapons"
    | "spells"
    | "abilities"
    | "basics";

export type ActionFilterState = {
    weapons: boolean;
    spells: boolean;
    abilities: boolean;
    basics: boolean;
};

export const DEFAULT_ACTION_FILTER_STATE: ActionFilterState = {
    weapons: true,
    spells: true,
    abilities: true,
    basics: true,
};

export function isActionFilterShowAll(state: ActionFilterState): boolean {
    return (
        state.weapons && state.spells && state.abilities && state.basics
    );
}

export function selectAllActionFilters(): ActionFilterState {
    return { ...DEFAULT_ACTION_FILTER_STATE };
}

export function toggleActionFilterCategory(
    state: ActionFilterState,
    category: ActionFilterCategory
): ActionFilterState {
    if (isActionFilterShowAll(state)) {
        return {
            weapons: category === "weapons",
            spells: category === "spells",
            abilities: category === "abilities",
            basics: category === "basics",
        };
    }

    const next: ActionFilterState = {
        ...state,
        [category]: !state[category],
    };

    if (
        !next.weapons &&
        !next.spells &&
        !next.abilities &&
        !next.basics
    ) {
        return selectAllActionFilters();
    }

    return next;
}

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
    weapon?: WeaponAction;
    spell?: SpellAction;
    featureSource?: ModifierSourceType;
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

function slotLabel(
    slotId: string,
    tSlots: (key: string) => string,
    tNatural?: string
): string {
    switch (slotId) {
        case "melee-main":
            return tSlots("meleeMain");
        case "melee-off":
            return tSlots("meleeOff");
        case "ranged-main":
            return tSlots("rangedMain");
        case "ranged-off":
            return tSlots("rangedOff");
        case "natural":
            return tNatural ?? slotId;
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

function displayFeatureCost(cost: string): ActionCost {
    switch (cost) {
        case "action":
        case "bonus":
        case "reaction":
        case "special":
        case "passive":
            return cost;
        default:
            return "special";
    }
}

function isActivatedAbility(
    grant: CharacterGrant
): grant is CharacterGrant & { kind: "ability"; activation: GrantActivation } {
    return grant.kind === "ability" && grant.activation != null;
}

function buildWeaponActions(
    stored: StoredCharacter,
    resolved: Stats,
    locale: Locale | undefined,
    tSlots: (key: string) => string,
    naturalWeaponLabel: string
): DisplayAction[] {
    const equipped = listEquippedWeaponActions(stored, resolved, locale);
    const natural = listNaturalWeaponActions(stored, resolved, locale);

    return [...equipped, ...natural].map((weapon) => {
        const item =
            weapon.slotId === "natural"
                ? undefined
                : getItem(weapon.slug, stored.system, locale);
        const rangeSummary =
            item?.weapon?.range != null
                ? item.weapon.longRange != null
                    ? `${item.weapon.range}/${item.weapon.longRange} ${item.weapon.distanceUnit ?? ""}`.trim()
                    : `${item.weapon.range} ${item.weapon.distanceUnit ?? ""}`.trim()
                : null;

        return {
            id: weapon.id,
            title: weapon.name,
            sourceType: "weapon" as const,
            actionCost: "action" as const,
            availability: "available" as const,
            badges: [slotLabel(weapon.slotId, tSlots, naturalWeaponLabel)],
            summary: [weapon.toHit, weapon.damage, rangeSummary].filter(
                Boolean
            ) as string[],
            description: weapon.description,
            rollRequest: buildWeaponAttackRollRequest(weapon) ?? undefined,
            actionLabel: "roll" as const,
            tags: [
                "weapon",
                weapon.slotId.startsWith("ranged") ? "ranged" : "melee",
            ],
            weapon,
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
            spell,
        };
    });
}

function abilityGrantToDisplayAction(
    grant: CharacterGrant & { kind: "ability"; activation: GrantActivation },
    resourceByRef: Map<string, CombatResourceEntry>,
    locale: Locale | undefined
): DisplayAction {
    const englishName = grant.name ?? grant.ref;
    const title = getAbilityFeatureName(englishName, locale);
    const actionCost = displayFeatureCost(grant.activation.cost);
    const resourceEntry = grant.activation.resourceRef
        ? resourceByRef.get(grant.activation.resourceRef)
        : undefined;
    const sourceType = grant.source.type === "item" ? "item" : "feature";

    return {
        id: grant.id,
        title,
        sourceType,
        actionCost,
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
            englishName,
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
        stateTags: actionCost === "passive" ? ["Passive"] : undefined,
        featureSource: grant.source.type,
    };
}

function activatedAbilityDisplays(
    stored: StoredCharacter,
    locale: Locale | undefined
): DisplayAction[] {
    const resourceEntries = listCombatResources(
        stored.grants ?? [],
        stored.resources
    );
    const resourceByRef = new Map(
        resourceEntries.map((entry) => [entry.ref, entry])
    );

    return (stored.grants ?? [])
        .filter(isActivatedAbility)
        .map((grant) =>
            abilityGrantToDisplayAction(grant, resourceByRef, locale)
        );
}

function buildFeatureActions(
    stored: StoredCharacter,
    locale: Locale | undefined
): DisplayAction[] {
    return activatedAbilityDisplays(stored, locale).filter(
        (action) => action.actionCost !== "passive"
    );
}

export function listCombatReminders(
    stored: StoredCharacter,
    locale: Locale | undefined
): DisplayAction[] {
    return activatedAbilityDisplays(stored, locale).filter(
        (action) => action.actionCost === "passive"
    );
}

export function buildDisplayActions(
    stored: StoredCharacter,
    resolved: Stats,
    locale: Locale | undefined,
    tSlots: (key: string) => string,
    naturalWeaponLabel = "Unarmed"
): DisplayAction[] {
    const resourceEntries = listCombatResources(stored.grants ?? [], stored.resources);
    const featureResources = new Map(resourceEntries.map((entry) => [entry.ref, entry]));

    return [
        ...buildWeaponActions(
            stored,
            resolved,
            locale,
            tSlots,
            naturalWeaponLabel
        ),
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

function matchesAbilitiesFilter(action: DisplayAction): boolean {
    if (
        action.sourceType !== "feature" &&
        action.sourceType !== "item"
    ) {
        return false;
    }
    return action.featureSource !== "system";
}

function matchesBasicsFilter(action: DisplayAction): boolean {
    return action.featureSource === "system";
}

export function filterDisplayActions(
    actions: DisplayAction[],
    filter: ActionFilterState
): DisplayAction[] {
    if (isActionFilterShowAll(filter)) {
        return actions;
    }

    return actions.filter((action) => {
        if (filter.weapons && action.sourceType === "weapon") {
            return true;
        }
        if (filter.spells && action.sourceType === "spell") {
            return true;
        }
        if (filter.abilities && matchesAbilitiesFilter(action)) {
            return true;
        }
        if (filter.basics && matchesBasicsFilter(action)) {
            return true;
        }
        return false;
    });
}

const ACTION_COST_ORDER: ActionCost[] = [
    "action",
    "bonus",
    "reaction",
    "special",
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
