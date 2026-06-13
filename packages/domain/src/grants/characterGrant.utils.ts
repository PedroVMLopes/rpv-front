import type { CharacterGrant } from "./characterGrant.types";
import type { ModifierSourceType } from "../modifiers/modifier.source";

export function removeGrantsBySource(
    grants: CharacterGrant[],
    source: { type: ModifierSourceType; id?: string }
): CharacterGrant[] {
    return grants.filter((grant) => {
        if (grant.source.type !== source.type) {
            return true;
        }

        if (source.id !== undefined && grant.source.id !== source.id) {
            return true;
        }

        return false;
    });
}

export function getLanguages(grants: CharacterGrant[]): CharacterGrant[] {
    return grants.filter((grant) => grant.kind === "language");
}

export function getAbilities(grants: CharacterGrant[]): CharacterGrant[] {
    return grants.filter((grant) => grant.kind === "ability");
}

export function getSpells(grants: CharacterGrant[]): CharacterGrant[] {
    return grants.filter((grant) => grant.kind === "spell");
}

export function getProficiencies(grants: CharacterGrant[]): CharacterGrant[] {
    return grants.filter((grant) => grant.kind === "proficiency");
}
