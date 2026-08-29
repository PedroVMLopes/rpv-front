import type { SpellCatalogEntry, SpellRollProfile } from "../spell/spell.types";

export const dndSpellRollProfiles: Record<string, SpellRollProfile> = {
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
    "scorching-ray": {
        mode: "attack",
        damageDice: "2d6",
        damageType: "fire",
    },
    fireball: {
        mode: "save",
        saveAbility: "dexterity",
        damageDice: "8d6",
        damageType: "fire",
    },
    "lightning-bolt": {
        mode: "save",
        saveAbility: "dexterity",
        damageDice: "8d6",
        damageType: "lightning",
    },
    "sacred-flame": {
        mode: "save",
        saveAbility: "dexterity",
        damageDice: "1d8",
        damageType: "radiant",
    },
    "guiding-bolt": {
        mode: "attack",
        damageDice: "4d6",
        damageType: "radiant",
    },
};

export function getSpellRollProfile(
    slug: string,
    catalogEntry?: SpellCatalogEntry
): SpellRollProfile | undefined {
    return catalogEntry?.rollProfile ?? dndSpellRollProfiles[slug];
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
