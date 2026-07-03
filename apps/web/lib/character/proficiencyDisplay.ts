import type { CharacterGrant } from "@rpv/domain";
import type { Skill } from "@rpv/content";

export type EquipmentProficiencyCategory =
    | "weapon"
    | "armor"
    | "tool"
    | "other";

export type DisplayProficiency = {
    id: string;
    ref: string;
    label: string;
    category: EquipmentProficiencyCategory;
};

export type DisplayLanguage = {
    id: string;
    ref: string;
    label: string;
};

export type PartitionedProficiencies = {
    weapons: DisplayProficiency[];
    armor: DisplayProficiency[];
    tools: DisplayProficiency[];
    other: DisplayProficiency[];
    languages: DisplayLanguage[];
};

const GRANT_TYPE_TO_CATEGORY: Record<string, EquipmentProficiencyCategory> = {
    weapon_proficiency: "weapon",
    armor_proficiency: "armor",
    tool_proficiency: "tool",
};

/**
 * Infers equipment proficiency category from the grant id, which embeds the
 * original grantType (e.g. `class-fighter-weapon_proficiency-martial-weapons-0`
 * or choice keys containing `weapon_proficiency`).
 */
export function proficiencyCategoryFromGrantId(
    id: string
): EquipmentProficiencyCategory {
    for (const [grantType, category] of Object.entries(GRANT_TYPE_TO_CATEGORY)) {
        if (id.includes(grantType)) {
            return category;
        }
    }

    return "other";
}

/** Humanize a kebab-case slug for display when no catalog name exists. */
export function humanizeProficiencyRef(ref: string): string {
    if (!ref.trim()) {
        return ref;
    }

    return ref
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function proficiencyLabel(grant: CharacterGrant): string {
    if (grant.name && grant.name.trim()) {
        return grant.name;
    }

    return humanizeProficiencyRef(grant.ref);
}

/**
 * Partitions character grants into equipment proficiency buckets and languages.
 * Skill proficiencies are excluded (handled by skill modifier helpers).
 */
export function partitionProficiencies(
    grants: CharacterGrant[],
    skills: Skill[]
): PartitionedProficiencies {
    const skillSlugs = new Set(skills.map((skill) => skill.slug));

    const result: PartitionedProficiencies = {
        weapons: [],
        armor: [],
        tools: [],
        other: [],
        languages: [],
    };

    for (const grant of grants) {
        if (grant.kind === "language") {
            result.languages.push({
                id: grant.id,
                ref: grant.ref,
                label: grant.name?.trim() ? grant.name : humanizeProficiencyRef(grant.ref),
            });
            continue;
        }

        if (grant.kind !== "proficiency") {
            continue;
        }

        if (skillSlugs.has(grant.ref)) {
            continue;
        }

        const category = proficiencyCategoryFromGrantId(grant.id);
        const entry: DisplayProficiency = {
            id: grant.id,
            ref: grant.ref,
            label: proficiencyLabel(grant),
            category,
        };

        if (category === "weapon") {
            result.weapons.push(entry);
        } else if (category === "armor") {
            result.armor.push(entry);
        } else if (category === "tool") {
            result.tools.push(entry);
        } else {
            result.other.push(entry);
        }
    }

    return result;
}
