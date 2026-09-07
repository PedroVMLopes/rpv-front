import type { GrantActivation, Locale, Stats } from "@rpv/domain";
import {
    getItem,
    getSpellRollProfile,
    listItemUseGrants,
    type Grant,
    type GrantUseEffect,
} from "@rpv/content";
import { contentRepo } from "@/lib/content/contentRepository";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import type { SpellAction } from "@/lib/character/combatActions";
import { computeSpellCombatPreview } from "@/lib/character/combatModifiers";
import { buildSpellcastingSystemData } from "@/lib/character/spellcastingContext";
import { getTotalBagQuantity } from "@/lib/character/inventory";

export type ConsumableAction = {
    id: string;
    itemSlug: string;
    itemName: string;
    grantIndex: number;
    quantity: number;
    activation: GrantActivation;
    useEffect: GrantUseEffect;
    title: string;
    description?: string;
    spell?: SpellAction;
    depleted: boolean;
    consumeQuantity: number;
};

function bagQuantityForSlug(
    stored: StoredCharacter,
    slug: string
): number {
    return getTotalBagQuantity(stored.selections.inventory, slug);
}

function buildSpellActionForConsumable(params: {
    stored: StoredCharacter;
    resolved: Stats;
    itemSlug: string;
    grantIndex: number;
    spellRef: string;
    locale?: Locale;
}): SpellAction {
    const { stored, resolved, itemSlug, grantIndex, spellRef, locale } = params;
    const spell = contentRepo(stored.system).getSpell(spellRef, locale);
    const rollProfile = getSpellRollProfile(spellRef, spell);
    const spellcastingSystemData = buildSpellcastingSystemData(stored);
    const combatPreview = computeSpellCombatPreview(
        rollProfile,
        resolved,
        stored.system,
        spellcastingSystemData
    );

    return {
        id: `consumable:${itemSlug}:${grantIndex}:spell:${spellRef}`,
        slug: spellRef,
        name: spell?.name ?? spellRef,
        levelInt: spell?.levelInt ?? null,
        description: spell?.description,
        attackBonus: combatPreview.attackBonus,
        saveDc: combatPreview.saveDc,
        attackModifier: combatPreview.attackModifier,
        saveDcValue: combatPreview.saveDcValue,
        rollProfile: combatPreview.rollProfile,
        source: { type: "item", id: itemSlug },
    };
}

function consumableFromGrant(params: {
    stored: StoredCharacter;
    resolved: Stats;
    itemSlug: string;
    itemName: string;
    itemDescription?: string;
    grant: Grant;
    grantIndex: number;
    quantity: number;
    locale?: Locale;
}): ConsumableAction | null {
    const {
        stored,
        resolved,
        itemSlug,
        itemName,
        itemDescription,
        grant,
        grantIndex,
        quantity,
        locale,
    } = params;

    if (!grant.activation || !grant.useEffect) {
        return null;
    }

    const consumeQuantity = grant.activation.consumeQuantity ?? 0;
    const depleted = consumeQuantity > 0 && quantity < consumeQuantity;

    const action: ConsumableAction = {
        id: `consumable:${itemSlug}:${grantIndex}`,
        itemSlug,
        itemName,
        grantIndex,
        quantity,
        activation: grant.activation,
        useEffect: grant.useEffect,
        title: grant.description?.trim() || itemName,
        description: itemDescription,
        depleted,
        consumeQuantity,
    };

    if (grant.useEffect.kind === "cast_spell") {
        action.spell = buildSpellActionForConsumable({
            stored,
            resolved,
            itemSlug,
            grantIndex,
            spellRef: grant.useEffect.spellRef,
            locale,
        });
        action.title = action.spell.name;
        action.description = action.spell.description ?? itemDescription;
    }

    if (grant.useEffect.kind === "heal") {
        const flat =
            grant.useEffect.flat != null ? ` + ${grant.useEffect.flat}` : "";
        action.title = itemName;
        action.description =
            itemDescription ??
            `${grant.useEffect.dice}${flat} hit points`;
    }

    return action;
}

/**
 * Derive activatable consumable actions from bag stacks (not from stored.grants).
 */
export function listConsumableActions(
    stored: StoredCharacter,
    resolved: Stats,
    locale?: Locale
): ConsumableAction[] {
    const inventory = stored.selections.inventory;
    const seen = new Set<string>();
    const actions: ConsumableAction[] = [];

    for (const stack of inventory.bag) {
        if (stack.quantity <= 0 || seen.has(stack.slug)) {
            continue;
        }
        seen.add(stack.slug);

        const item = getItem(stack.slug, stored.system, locale);
        if (!item) {
            continue;
        }

        const useGrants = listItemUseGrants(item);
        if (useGrants.length === 0) {
            continue;
        }

        const quantity = bagQuantityForSlug(stored, stack.slug);

        useGrants.forEach((grant, grantIndex) => {
            const action = consumableFromGrant({
                stored,
                resolved,
                itemSlug: stack.slug,
                itemName: item.name,
                itemDescription: item.description,
                grant,
                grantIndex,
                quantity,
                locale,
            });
            if (action) {
                actions.push(action);
            }
        });
    }

    return actions;
}

export function findConsumableAction(
    stored: StoredCharacter,
    resolved: Stats,
    itemSlug: string,
    grantIndex = 0,
    locale?: Locale
): ConsumableAction | undefined {
    return listConsumableActions(stored, resolved, locale).find(
        (action) =>
            action.itemSlug === itemSlug && action.grantIndex === grantIndex
    );
}
