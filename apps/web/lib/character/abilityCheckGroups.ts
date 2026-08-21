import type { CharacterGrant, StatKey, Stats } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import {
    computeSavingThrowModifiers,
    type SavingThrowModifier,
} from "./savingThrowModifiers";
import {
    computeSkillModifiers,
    type SkillModifier,
} from "./skillModifiers";
import { getSystemRules } from "./systemRules";

export type AbilityCheckGroup = {
    stat: StatKey;
    score: number;
    modifier: number;
    save: SavingThrowModifier;
    skills: SkillModifier[];
};

export function groupAbilityChecks(
    system: SystemKey,
    stats: Stats,
    grants: CharacterGrant[],
    level: number
): AbilityCheckGroup[] {
    const rules = getSystemRules(system);
    const saves = computeSavingThrowModifiers(system, stats, grants, level);
    const skills = computeSkillModifiers(system, stats, grants, level);
    const saveByStat = new Map(saves.map((save) => [save.stat, save]));

    return rules.savingThrows.flatMap((stat) => {
        const save = saveByStat.get(stat);

        if (!save) {
            return [];
        }

        const score = stats[stat] ?? 10;

        return [
            {
                stat,
                score,
                modifier: rules.abilityModifier(score),
                save,
                skills: skills.filter((skill) => skill.ability === stat),
            },
        ];
    });
}
