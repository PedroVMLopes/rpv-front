import type { SpellRollProfile } from "../spell/spell.types";

const dndSpellRollProfiles: Record<string, SpellRollProfile> = {
    "fire-bolt": {
        mode: "attack",
        damageDice: "1d10",
        damageType: "fire",
    },
    "burning-hands": {
        mode: "save",
        saveAbility: "dexterity",
        damageDice: "3d6",
        damageType: "fire",
    },
    "acid-splash": {
        mode: "save",
        saveAbility: "dexterity",
        damageDice: "1d6",
        damageType: "acid",
    },
    "magic-missile": {
        mode: "damage_only",
        damageDice: "3d4",
        damageType: "force",
        flatPerDie: 1,
    },
    sleep: {
        mode: "damage_only",
        damageDice: "5d8",
    },
};

export function getSpellRollProfile(slug: string): SpellRollProfile | undefined {
    return dndSpellRollProfiles[slug];
}

export function getSpellRollUseLabel(profile: SpellRollProfile): string {
    if (profile.mode === "damage_only" && profile.flatPerDie) {
        const match = profile.damageDice.match(/^(\d+)d(\d+)$/);
        if (match) {
            return `${match[1]}d${match[2]}+${profile.flatPerDie}`;
        }
    }

    return profile.damageDice;
}
