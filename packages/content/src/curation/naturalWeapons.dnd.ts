import type { Locale, StatKey } from "@rpv/domain";
import { localizeCurationEntry } from "./curationLocale";

export type NaturalWeaponEntry = {
    slug: string;
    name: string;
    description?: string;
    attackAbility: StatKey;
    alwaysProficient: boolean;
    damageFlatBase: number;
    damageType: string;
};

const dndNaturalWeapons: NaturalWeaponEntry[] = [
    {
        slug: "unarmed-strike",
        name: "Unarmed Strike",
        description:
            "Instead of using a weapon to make a melee weapon attack, you can use an unarmed strike: a punch, kick, head-butt, or similar forceful blow (none of which count as weapons). On a hit, an unarmed strike deals bludgeoning damage equal to 1 + your Strength modifier. You are proficient with your unarmed strikes.",
        attackAbility: "strength",
        alwaysProficient: true,
        damageFlatBase: 1,
        damageType: "bludgeoning",
    },
];

function localizeNaturalWeapon(
    entry: NaturalWeaponEntry,
    locale?: Locale
): NaturalWeaponEntry {
    return localizeCurationEntry(entry, "features", locale);
}

export function localizeNaturalWeaponEntries(
    locale?: Locale
): NaturalWeaponEntry[] {
    return dndNaturalWeapons.map((entry) =>
        localizeNaturalWeapon(entry, locale)
    );
}

/** Natural weapons that every character of this system has (not inventory items). */
export function getNaturalWeapons(
    system: string,
    locale?: Locale
): NaturalWeaponEntry[] {
    if (system !== "dnd") {
        return [];
    }

    return localizeNaturalWeaponEntries(locale);
}
