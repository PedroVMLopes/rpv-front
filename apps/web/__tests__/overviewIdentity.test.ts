import { emptyInventory } from "@rpv/domain";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import {
    listOverviewOriginFacts,
    listOverviewPersonalityFields,
    resolveOverviewBackground,
} from "../lib/character/overviewIdentity";

function baseStored(overrides: Partial<StoredCharacter> = {}): StoredCharacter {
    return {
        id: "overview-identity-1",
        schemaVersion: 1,
        type: "player",
        system: "dnd",
        language: "en",
        name: "Hero",
        baseStats: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
            armorClass: 10,
            hitPoints: 10,
        },
        modifiers: [],
        grants: [],
        selections: {
            choices: {},
            inventory: emptyInventory(),
        },
        resources: { hp: 10 },
        systemData: {},
        ...overrides,
    };
}

describe("resolveOverviewBackground", () => {
    it("resolves catalog name and description from selections", () => {
        const background = resolveOverviewBackground(
            baseStored({
                selections: {
                    background: "sage",
                    choices: {},
                    inventory: emptyInventory(),
                },
            })
        );

        expect(background?.name).toBe("Sage");
        expect(background?.description).toMatch(/lore of the multiverse/i);
    });

    it("falls back to leftover systemData background text", () => {
        const background = resolveOverviewBackground(
            baseStored({
                systemData: { background: "Soldier" },
            })
        );

        expect(background).toEqual({ name: "Soldier" });
    });
});

describe("listOverviewPersonalityFields", () => {
    it("returns only non-empty personality fields in display order", () => {
        const fields = listOverviewPersonalityFields(
            baseStored({
                systemData: {
                    personalityTraits: "  I laugh loudly.  ",
                    ideals: "",
                    bonds: "My crew",
                    goals: "See the ocean",
                },
            })
        );

        expect(fields).toEqual([
            { key: "personalityTraits", value: "I laugh loudly." },
            { key: "bonds", value: "My crew" },
            { key: "goals", value: "See the ocean" },
        ]);
    });
});

describe("listOverviewOriginFacts", () => {
    it("lists background, size, darkvision, and hit die from catalog data", () => {
        const facts = listOverviewOriginFacts(
            baseStored({
                selections: {
                    race: "dwarf",
                    characterClass: "fighter",
                    background: "sage",
                    choices: {},
                    inventory: emptyInventory(),
                },
            })
        );

        expect(facts).toEqual([
            { key: "background", value: "Sage" },
            { key: "size", value: "Medium" },
            { key: "darkvision", rangeFeet: 60 },
            { key: "hitDie", die: 10 },
        ]);
    });

    it("omits age and skips missing catalog facts", () => {
        const facts = listOverviewOriginFacts(
            baseStored({
                systemData: { age: "Adult", background: "Soldier" },
            })
        );

        expect(facts).toEqual([{ key: "background", value: "Soldier" }]);
    });
});
