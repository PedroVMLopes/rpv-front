import type { CharacterGrant, CharacterInventory } from "@rpv/domain";
import {
    armorProficiencyRefForItem,
    characterIsProficientWithArmor,
    getItem,
    type ItemEntry,
} from "@rpv/content";
import type { SystemKey } from "@/presets";

function proficiencyRefs(grants: CharacterGrant[]): string[] {
    return grants
        .filter((grant) => grant.kind === "proficiency")
        .map((grant) => grant.ref);
}

function equippedArmorSlugs(
    inventory: CharacterInventory | undefined
): string[] {
    if (!inventory) {
        return [];
    }

    const slugs = Object.values(inventory.equipped ?? {}).filter(
        (slug): slug is string => Boolean(slug)
    );
    const multi = Object.values(inventory.equippedMulti ?? {}).flat();
    return [...slugs, ...multi];
}

export function itemLacksArmorProficiency(
    item: ItemEntry,
    grants: CharacterGrant[]
): boolean {
    if (!armorProficiencyRefForItem(item)) {
        return false;
    }

    return !characterIsProficientWithArmor(item, proficiencyRefs(grants));
}

export function listEquippedArmorProficiencyWarnings(
    inventory: CharacterInventory | undefined,
    grants: CharacterGrant[],
    system: SystemKey
): ItemEntry[] {
    const seen = new Set<string>();
    const warnings: ItemEntry[] = [];

    for (const slug of equippedArmorSlugs(inventory)) {
        if (seen.has(slug)) {
            continue;
        }
        seen.add(slug);

        const item = getItem(slug, system);
        if (!item) {
            continue;
        }

        if (itemLacksArmorProficiency(item, grants)) {
            warnings.push(item);
        }
    }

    return warnings;
}
