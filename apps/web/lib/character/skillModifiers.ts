import type { CharacterGrant, StatKey, Stats } from "@rpv/domain";
import type { Skill } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { getSystemRules } from "./systemRules";
import { readLevelFromForm } from "./level";

export type SkillModifier = {
    slug: string;
    name: string;
    ability: StatKey;
    modifier: number;
    proficient: boolean;
};

export function readCharacterLevel(systemData: Record<string, unknown>): number {
    return readLevelFromForm(systemData);
}

export function getProficientSkillSlugs(
    grants: CharacterGrant[],
    skills: Skill[]
): Set<string> {
    const skillSlugs = new Set(skills.map((skill) => skill.slug));

    return new Set(
        grants
            .filter(
                (grant) =>
                    grant.kind === "proficiency" && skillSlugs.has(grant.ref)
            )
            .map((grant) => grant.ref)
    );
}

export function formatModifier(value: number): string {
    if (value >= 0) {
        return `+${value}`;
    }

    return String(value);
}

export function computeSkillModifiers(
    system: SystemKey,
    stats: Stats,
    grants: CharacterGrant[],
    level: number
): SkillModifier[] {
    const rules = getSystemRules(system);
    const proficientSlugs = getProficientSkillSlugs(grants, rules.skills);
    const bonus = rules.proficiencyBonus(level);

    return rules.skills.map((skill) => {
        const abilityMod = rules.abilityModifier(stats[skill.ability] ?? 10);
        const proficient = proficientSlugs.has(skill.slug);

        return {
            slug: skill.slug,
            name: skill.name,
            ability: skill.ability,
            modifier: abilityMod + (proficient ? bonus : 0),
            proficient,
        };
    });
}
