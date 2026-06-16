import type { CharacterGrant, StatKey, Stats } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { getSystemRules } from "./systemRules";

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
    system: SystemKey,
    stats: Stats,
    grants: CharacterGrant[],
    level: number
): SavingThrowModifier[] {
    const rules = getSystemRules(system);
    const proficientStats = getProficientSaveStats(grants);
    const bonus = rules.proficiencyBonus(level);

    return rules.savingThrows.map((stat) => {
        const proficient = proficientStats.has(stat);
        const abilityMod = rules.abilityModifier(stats[stat] ?? 10);

        return {
            stat,
            proficient,
            modifier: abilityMod + (proficient ? bonus : 0),
        };
    });
}
