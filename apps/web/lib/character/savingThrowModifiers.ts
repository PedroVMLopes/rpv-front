import type { CharacterGrant, StatKey, Stats } from "@rpv/domain";
import {
    abilityModifier,
    proficiencyBonus,
} from "@/lib/character/skillModifiers";

export type SavingThrowModifier = {
    stat: StatKey;
    modifier: number;
    proficient: boolean;
};

export function getProficientSaveStats(
    grants: CharacterGrant[]
): Set<string> {
    return new Set(
        grants
            .filter((grant) => grant.kind === "saving_throw")
            .map((grant) => grant.ref)
    );
}

export function computeSavingThrowModifiers(
    stats: Stats,
    grants: CharacterGrant[],
    level: number,
    saves: StatKey[]
): SavingThrowModifier[] {
    const proficientStats = getProficientSaveStats(grants);
    const bonus = proficiencyBonus(level);

    return saves.map((stat) => {
        const proficient = proficientStats.has(stat);
        const abilityMod = abilityModifier(stats[stat] ?? 10);

        return {
            stat,
            proficient,
            modifier: abilityMod + (proficient ? bonus : 0),
        };
    });
}
