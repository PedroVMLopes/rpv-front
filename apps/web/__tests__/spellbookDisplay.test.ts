import { listMagicSpellbookEntries } from "../lib/character/spellbookDisplay";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import type { Stats } from "@rpv/domain";

const baseStats: Stats = {
    strength: 8,
    dexterity: 14,
    constitution: 12,
    intelligence: 16,
    wisdom: 10,
    charisma: 10,
    armorClass: 12,
    hitPoints: 8,
};

function wizardStored(
    overrides?: Partial<StoredCharacter>
): StoredCharacter {
    return {
        id: "wizard-spellbook-display",
        schemaVersion: 1,
        type: "player",
        system: "dnd",
        language: "en",
        name: "Wizard",
        baseStats,
        modifiers: [],
        grants: [
            {
                id: "spell-fire-bolt",
                kind: "spell",
                ref: "fire-bolt",
                source: { type: "class", id: "wizard" },
                name: "Fire Bolt",
            },
            {
                id: "spell-burning-hands",
                kind: "spell",
                ref: "burning-hands",
                source: { type: "class", id: "wizard" },
                name: "Burning Hands",
            },
            {
                id: "spell-magic-missile",
                kind: "spell",
                ref: "magic-missile",
                source: { type: "class", id: "wizard" },
                name: "Magic Missile",
            },
        ],
        selections: {
            characterClass: "wizard",
            choices: {
                preparedSpells: ["burning-hands"],
            },
            inventory: { bag: [], equipped: {} },
        },
        resources: { hp: 8, "spell-slots-1": 2 },
        systemData: { characterClass: "wizard", level: 1 },
        ...overrides,
    };
}

describe("listMagicSpellbookEntries", () => {
    it("marks known unprepared leveled spells for spellbook casters", () => {
        const { cantrips, spells } = listMagicSpellbookEntries(
            wizardStored(),
            baseStats,
            "en"
        );

        expect(cantrips).toHaveLength(1);
        expect(cantrips[0]?.castable).toBe(true);
        expect(cantrips[0]?.spell.slug).toBe("fire-bolt");

        expect(spells.map((entry) => entry.spell.slug)).toEqual([
            "burning-hands",
            "magic-missile",
        ]);
        expect(spells[0]?.castable).toBe(true);
        expect(spells[1]?.castable).toBe(false);
    });

    it("returns only castable entries for prepared-list classes", () => {
        const cleric: StoredCharacter = {
            id: "cleric-spellbook-display",
            schemaVersion: 1,
            type: "player",
            system: "dnd",
            language: "en",
            name: "Cleric",
            baseStats: {
                ...baseStats,
                intelligence: 10,
                wisdom: 16,
            },
            modifiers: [],
            grants: [
                {
                    id: "spell-sacred-flame",
                    kind: "spell",
                    ref: "sacred-flame",
                    source: { type: "class", id: "cleric" },
                    name: "Sacred Flame",
                },
            ],
            selections: {
                characterClass: "cleric",
                choices: {
                    preparedSpells: ["guiding-bolt"],
                },
                inventory: { bag: [], equipped: {} },
            },
            resources: { hp: 8, "spell-slots-1": 2 },
            systemData: { characterClass: "cleric", level: 1 },
        };

        const { cantrips, spells } = listMagicSpellbookEntries(
            cleric,
            cleric.baseStats,
            "en"
        );

        expect(cantrips.every((entry) => entry.castable)).toBe(true);
        expect(spells.every((entry) => entry.castable)).toBe(true);
        expect(spells.some((entry) => entry.spell.slug === "guiding-bolt")).toBe(
            true
        );
        // Class-list spells not prepared must not flood the Magic tab.
        expect(
            spells.some((entry) => entry.spell.slug === "cure-wounds")
        ).toBe(false);
    });
});
