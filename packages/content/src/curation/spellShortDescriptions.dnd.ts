/** Hand-curated one-line spell summaries (default locale: en). */
const dndSpellShortDescriptions: Record<string, string> = {
    "acid-splash":
        "1 or 2 targets within 5 ft of each other; Dexterity save; 1d6 acid damage on fail",
    "burning-hands":
        "15-foot cone; Dexterity save; 3d6 fire damage, half on success; ignites flammable objects",
    counterspell:
        "interrupt a creature casting a spell; auto-succeeds vs 3rd level or lower, ability check otherwise",
    "detect-magic":
        "sense magic within 30 feet; action to see auras on visible magical creatures or objects",
    "feather-fall":
        "up to 5 falling creatures; descent slows to 60 ft/round; no falling damage if they land in time",
    "fire-bolt":
        "ranged spell attack; 1d10 fire damage on hit",
    fireball:
        "20-foot-radius sphere; Dexterity save; 8d6 fire damage, half on success; ignites flammable objects",
    fly: "willing creature gains 60 ft flying speed; falls when the spell ends if still aloft",
    "hold-person":
        "one humanoid; Wisdom save or paralyzed; repeat save at end of each turn",
    identify:
        "touch an object to learn its magical properties, attunement needs, and charges",
    invisibility:
        "touched creature becomes invisible until it attacks or casts a spell",
    light: "touched object sheds bright light 20 ft and dim light 20 ft more",
    "lightning-bolt":
        "100-foot line, 5 ft wide; Dexterity save; 8d6 lightning damage, half on success",
    "mage-armor":
        "willing unarmored creature; base AC becomes 13 + Dexterity modifier",
    "mage-hand":
        "spectral hand manipulates objects, opens unlocked containers, or pours vials within range",
    "magic-missile":
        "three darts; each deals 1d4+1 force damage; hit automatically, can split targets",
    "misty-step": "bonus action teleport up to 30 feet to a seen unoccupied space",
    "scorching-ray":
        "three rays; ranged spell attack each; 2d6 fire damage on hit",
    shield:
        "reaction; +5 AC until your next turn and immune to magic missile",
    sleep:
        "5d8 HP of creatures in a 20-foot radius fall asleep, lowest HP first",
    bless:
        "up to three creatures add 1d4 to attack rolls and saving throws",
    "cure-wounds":
        "touched creature regains 1d8 + spellcasting modifier hit points",
    "guiding-bolt":
        "ranged spell attack; 4d6 radiant damage and the next attack against the target has advantage",
    "sacred-flame":
        "Dexterity save, no cover; 1d8 radiant damage on fail",
};

export function getSpellShortDescription(slug: string): string | undefined {
    return dndSpellShortDescriptions[slug];
}

export function listSpellShortDescriptionSlugs(): string[] {
    return Object.keys(dndSpellShortDescriptions);
}
