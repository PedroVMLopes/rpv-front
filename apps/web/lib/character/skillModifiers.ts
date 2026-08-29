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
    /** 0 = not proficient, 1 = proficient, ≥2 = doubled (or more) PB. */
    proficiencyScale: number;
};

export function getSkillProficiencyScale(
    grants: CharacterGrant[],
    skillSlug: string
): number {
    let scale = 0;

    for (const grant of grants) {
        if (grant.kind !== "proficiency" || grant.ref !== skillSlug) {
            continue;
        }

        scale = Math.max(scale, grant.proficiencyScale ?? 1);
    }

    return scale;
}

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

export function sortSkillModifiersByAbilityOrder(
    system: SystemKey,
    skills: SkillModifier[]
): SkillModifier[] {
    const rules = getSystemRules(system);
    const abilityOrder = new Map(
        rules.savingThrows.map((stat, index) => [stat, index])
    );
    const catalogOrder = new Map(
        rules.skills.map((skill, index) => [skill.slug, index])
    );

    return [...skills].sort((left, right) => {
        const abilityDiff =
            (abilityOrder.get(left.ability) ?? 0) -
            (abilityOrder.get(right.ability) ?? 0);

        if (abilityDiff !== 0) {
            return abilityDiff;
        }

        return (
            (catalogOrder.get(left.slug) ?? 0) - (catalogOrder.get(right.slug) ?? 0)
        );
    });
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
        const proficiencyScale = proficientSlugs.has(skill.slug)
            ? getSkillProficiencyScale(grants, skill.slug)
            : 0;
        const proficient = proficiencyScale > 0;

        return {
            slug: skill.slug,
            name: skill.name,
            ability: skill.ability,
            modifier: abilityMod + bonus * proficiencyScale,
            proficient,
            proficiencyScale,
        };
    });
}
