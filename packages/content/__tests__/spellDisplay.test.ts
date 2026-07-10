import {
    getSpellDisplayMeta,
    listSpellDisplayMetaSlugs,
} from "../src/curation/spellDisplay.dnd";
import {
    getSpellRollProfile,
    getSpellRollUseLabel,
} from "../src/curation/spellCombat.dnd";

const PILOT_SPELL_SLUGS = [
    "acid-splash",
    "burning-hands",
    "detect-magic",
    "feather-fall",
    "fire-bolt",
    "identify",
    "light",
    "mage-armor",
    "mage-hand",
    "magic-missile",
    "shield",
    "sleep",
];

describe("spellDisplay.dnd", () => {
    it("curates display meta for every pilot spell slug", () => {
        expect(listSpellDisplayMetaSlugs().sort()).toEqual(
            [...PILOT_SPELL_SLUGS].sort()
        );

        for (const slug of PILOT_SPELL_SLUGS) {
            expect(getSpellDisplayMeta(slug)).toBeDefined();
        }
    });

    it("returns undefined for unknown spell display meta", () => {
        expect(getSpellDisplayMeta("unknown-spell")).toBeUndefined();
    });
});

describe("spellCombat.dnd expanded profiles", () => {
    it("returns attack profile for fire-bolt", () => {
        expect(getSpellRollProfile("fire-bolt")).toEqual({
            mode: "attack",
            damageDice: "1d10",
            damageType: "fire",
        });
    });

    it("returns save profile for burning-hands", () => {
        expect(getSpellRollProfile("burning-hands")).toEqual({
            mode: "save",
            saveAbility: "dexterity",
            damageDice: "3d6",
            damageType: "fire",
        });
    });

    it("returns damage_only profile for magic-missile", () => {
        expect(getSpellRollProfile("magic-missile")).toEqual({
            mode: "damage_only",
            damageDice: "3d4",
            damageType: "force",
            flatPerDie: 1,
        });
        const profile = getSpellRollProfile("magic-missile");
        expect(profile).toBeDefined();
        expect(getSpellRollUseLabel(profile as NonNullable<typeof profile>)).toBe(
            "3d4+1"
        );
    });

    it("returns undefined for unknown spell", () => {
        expect(getSpellRollProfile("unknown-spell")).toBeUndefined();
    });
});
