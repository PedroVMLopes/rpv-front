import type {
    CharacterGrant,
    CharacterGrantKind,
    ModifierSourceType,
} from "@rpv/domain";

export function listGrantsBySource(
    grants: CharacterGrant[],
    sourceType: ModifierSourceType,
    kinds: CharacterGrantKind[]
): CharacterGrant[] {
    const kindSet = new Set(kinds);
    return grants.filter(
        (grant) => grant.source.type === sourceType && kindSet.has(grant.kind)
    );
}

/** Proficiencies and other grants not shown in dedicated class/subclass sections. */
export function isGrantedFeaturesEntry(grant: CharacterGrant): boolean {
    if (grant.kind === "language" || grant.kind === "resource") {
        return false;
    }

    if (
        (grant.source.type === "class" || grant.source.type === "subclass") &&
        (grant.kind === "ability" || grant.kind === "spell")
    ) {
        return false;
    }

    return true;
}

export type DerivedResource = {
    ref: string;
    count: number;
};

const EXCLUDED_DERIVED_RESOURCE_KEYS = new Set(["hp"]);
const SPELL_SLOT_REF_PREFIX = "spell-slots-";

export function listOtherDerivedResources(
    resources: Record<string, number>
): DerivedResource[] {
    return Object.entries(resources)
        .flatMap(([ref, count]) => {
            if (
                EXCLUDED_DERIVED_RESOURCE_KEYS.has(ref) ||
                ref.startsWith(SPELL_SLOT_REF_PREFIX) ||
                count <= 0
            ) {
                return [];
            }

            return [{ ref, count }];
        })
        .sort((a, b) => a.ref.localeCompare(b.ref));
}
