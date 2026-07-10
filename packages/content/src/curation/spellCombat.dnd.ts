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
};

export function getSpellRollProfile(slug: string): SpellRollProfile | undefined {
    return dndSpellRollProfiles[slug];
}
