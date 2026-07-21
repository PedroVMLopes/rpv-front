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
});
