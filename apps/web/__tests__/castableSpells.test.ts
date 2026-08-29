import type { CharacterGrant } from "@rpv/domain";
import { filterCastableSpellGrants } from "../lib/character/castableSpells";

const fireBolt: CharacterGrant = {
    id: "class-wizard-spell-fire-bolt",
    kind: "spell",
    ref: "fire-bolt",
    source: { type: "class", id: "wizard" },
    name: "Fire Bolt",
};

const burningHands: CharacterGrant = {
    id: "class-wizard-spell-burning-hands",
    kind: "spell",
    ref: "burning-hands",
    source: { type: "class", id: "wizard" },
    name: "Burning Hands",
};

const racialCantrip: CharacterGrant = {
    id: "race-high-elf-spell-acid-splash",
    kind: "spell",
    ref: "acid-splash",
    source: { type: "race", id: "high-elf" },
    name: "Acid Splash",
};

const fighterAbility: CharacterGrant = {
    id: "class-fighter-ability",
    kind: "ability",
    ref: "second-wind",
    source: { type: "class", id: "fighter" },
};

describe("filterCastableSpellGrants", () => {
    it("keeps only cantrips for spellbook mode when preparedSpells is empty", () => {
        const result = filterCastableSpellGrants({
            grants: [fireBolt, burningHands, fighterAbility],
            characterClass: "wizard",
            preparedSpells: [],
        });

        expect(result.map((grant) => grant.ref)).toEqual(["fire-bolt"]);
    });

    it("includes prepared leveled spells for spellbook mode", () => {
        const result = filterCastableSpellGrants({
            grants: [fireBolt, burningHands],
            characterClass: "wizard",
            preparedSpells: ["burning-hands"],
        });

        expect(result.map((grant) => grant.ref)).toEqual([
            "fire-bolt",
            "burning-hands",
        ]);
    });

    it("returns all spell grants when class has no spellcastingMode", () => {
        const result = filterCastableSpellGrants({
            grants: [fireBolt, burningHands, fighterAbility],
            characterClass: "fighter",
            preparedSpells: [],
        });

        expect(result.map((grant) => grant.ref)).toEqual([
            "fire-bolt",
            "burning-hands",
        ]);
    });

    it("always includes racial cantrips under spellbook mode", () => {
        const result = filterCastableSpellGrants({
            grants: [racialCantrip, burningHands],
            characterClass: "wizard",
            preparedSpells: [],
        });

        expect(result.map((grant) => grant.ref)).toEqual(["acid-splash"]);
    });

    it("clamps prepared leveled spells to preparedQuota", () => {
        const detectMagic: CharacterGrant = {
            id: "class-wizard-spell-detect-magic",
            kind: "spell",
            ref: "detect-magic",
            source: { type: "class", id: "wizard" },
            name: "Detect Magic",
        };

        const result = filterCastableSpellGrants({
            grants: [fireBolt, burningHands, detectMagic],
            characterClass: "wizard",
            preparedSpells: ["burning-hands", "detect-magic"],
            preparedQuota: 1,
        });

        expect(result.map((grant) => grant.ref)).toEqual([
            "fire-bolt",
            "burning-hands",
        ]);
    });

    it("includes cantrips, domain grants, and prepared class-list spells for prepared-list", () => {
        const sacredFlame: CharacterGrant = {
            id: "class-cleric-spell-sacred-flame",
            kind: "spell",
            ref: "sacred-flame",
            source: { type: "class", id: "cleric" },
            name: "Sacred Flame",
        };
        const bless: CharacterGrant = {
            id: "subclass-cleric-life-spell-bless",
            kind: "spell",
            ref: "bless",
            source: { type: "subclass", id: "cleric-life" },
            name: "Bless",
        };

        const result = filterCastableSpellGrants({
            grants: [sacredFlame, bless],
            characterClass: "cleric",
            preparedSpells: ["guiding-bolt", "detect-magic"],
        });

        expect(result.map((grant) => grant.ref)).toEqual([
            "sacred-flame",
            "bless",
            "guiding-bolt",
            "detect-magic",
        ]);
    });

    it("does not require class-list spells to already be grants in prepared-list mode", () => {
        const sacredFlame: CharacterGrant = {
            id: "class-cleric-spell-sacred-flame",
            kind: "spell",
            ref: "sacred-flame",
            source: { type: "class", id: "cleric" },
        };

        const result = filterCastableSpellGrants({
            grants: [sacredFlame],
            characterClass: "cleric",
            preparedSpells: [],
        });

        expect(result.map((grant) => grant.ref)).toEqual(["sacred-flame"]);
    });

    it("returns all spell grants for pact mode without requiring preparedSpells", () => {
        const result = filterCastableSpellGrants({
            grants: [fireBolt, burningHands],
            characterClass: "warlock",
            preparedSpells: [],
        });

        expect(result.map((grant) => grant.ref)).toEqual([
            "fire-bolt",
            "burning-hands",
        ]);
    });
});
