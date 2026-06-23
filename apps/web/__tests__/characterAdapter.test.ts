import { emptyInventory } from "@rpv/domain";
import {
    flattenStoredToForm,
    formDataToStoredCharacter,
    normalizeCharacterSelections,
    normalizeStoredCharacter,
    buildSelectionsFromForm,
} from "../lib/character/characterAdapter";

describe("characterAdapter system-agnostic mapping", () => {
    const formData = {
        name: "Test Hero",
        hp: 8,
        maxHp: 10,
        ac: 12,
        level: 3,
        characterClass: "Fighter",
        goals: "Find the dragon",
        attributes: [
            { name: "strength", value: 14 },
            { name: "dexterity", value: 10 },
            { name: "constitution", value: 12 },
            { name: "intelligence", value: 10 },
            { name: "wisdom", value: 10 },
            { name: "charisma", value: 8 },
        ],
    };

    it("maps form data into stored character with resources and systemData", () => {
        const stored = formDataToStoredCharacter(
            formData,
            "char-1",
            "player",
            "dnd",
            []
        );

        expect(stored.name).toBe("Test Hero");
        expect(stored.resources.hp).toBe(8);
        expect(stored.systemData.level).toBe(3);
        expect(stored.systemData.goals).toBe("Find the dragon");
        expect(stored.systemData).not.toHaveProperty("characterClass");
        expect(stored.baseStats.strength).toBe(14);
        expect(stored.baseStats.hitPoints).toBe(10);
        expect(stored.baseStats.armorClass).toBe(12);
        expect(stored.selections).toEqual({
            race: undefined,
            subrace: undefined,
            characterClass: "fighter",
            subclass: undefined,
            background: undefined,
            inventory: emptyInventory(),
            choices: {},
        });
        expect(stored).not.toHaveProperty("hp");
        expect(stored).not.toHaveProperty("characterClass");
    });

    it("round-trips stored character back to form shape", () => {
        const stored = formDataToStoredCharacter(
            formData,
            "char-1",
            "player",
            "dnd",
            []
        );

        const flattened = flattenStoredToForm(stored, "dnd");

        expect(flattened.name).toBe("Test Hero");
        expect(flattened.hp).toBe(8);
        expect(flattened.maxHp).toBe(10);
        expect(flattened.ac).toBe(12);
        expect(flattened.characterClass).toBe("fighter");
        expect(flattened.level).toBe(3);
        expect(flattened.attributes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: "strength", value: 14 }),
            ])
        );
    });

    it("defaults new characters to the English content language", () => {
        const stored = formDataToStoredCharacter(
            formData,
            "char-1",
            "player",
            "dnd",
            []
        );

        expect(stored.language).toBe("en");
    });

    it("honors an explicit content language from the form", () => {
        const stored = formDataToStoredCharacter(
            { ...formData, language: "pt-BR" },
            "char-1",
            "player",
            "dnd",
            []
        );

        expect(stored.language).toBe("pt-BR");
    });

    it("builds selections from race and subrace form fields", () => {
        const stored = formDataToStoredCharacter(
            { ...formData, race: "elf", subrace: "high-elf" },
            "char-1",
            "player",
            "dnd",
            []
        );

        expect(stored.selections).toEqual({
            race: "elf",
            subrace: "high-elf",
            characterClass: "fighter",
            subclass: undefined,
            background: undefined,
            inventory: emptyInventory(),
            choices: {},
        });
        expect(stored.systemData).not.toHaveProperty("race");
        expect(stored.systemData).not.toHaveProperty("subrace");
    });

    it("preserves existing choices when rebuilding selections", () => {
        const selections = buildSelectionsFromForm(
            { race: "dwarf", subrace: "hill-dwarf" },
            {
                race: "elf",
                subrace: "high-elf",
                inventory: emptyInventory(),
                choices: { grantPicks: { cantrip: "acid-splash" } },
            }
        );

        expect(selections).toEqual({
            race: "dwarf",
            subrace: "hill-dwarf",
            characterClass: undefined,
            subclass: undefined,
            background: undefined,
            inventory: emptyInventory(),
            choices: { grantPicks: { cantrip: "acid-splash" } },
        });
    });

    it("backfills language for stored characters persisted before i18n", () => {
        const stored = normalizeStoredCharacter({
            id: "no-lang",
            type: "player",
            system: "dnd",
            name: "Pre-i18n Hero",
            baseStats: {},
            modifiers: [],
            resources: { hp: 5 },
            systemData: {},
        });

        expect(stored.language).toBe("en");
        expect(stored.selections).toEqual({
            race: undefined,
            subrace: undefined,
            characterClass: undefined,
            subclass: undefined,
            background: undefined,
            inventory: emptyInventory(),
            choices: {},
        });
    });

    it("backfills selections from systemData when missing", () => {
        const stored = normalizeStoredCharacter({
            id: "with-race",
            type: "player",
            system: "dnd",
            language: "en",
            name: "Race Hero",
            baseStats: {},
            modifiers: [],
            resources: { hp: 5 },
            systemData: { race: "elf", subrace: "high-elf" },
        });

        expect(stored.selections).toEqual({
            race: "elf",
            subrace: "high-elf",
            characterClass: undefined,
            subclass: undefined,
            background: undefined,
            inventory: emptyInventory(),
            choices: {},
        });
    });

    it("migrates legacy localStorage character shape", () => {
        const legacy = {
            id: "legacy-1",
            type: "player",
            system: "dnd",
            name: "Legacy Hero",
            hp: 5,
            maxHp: 10,
            ac: 11,
            characterClass: "Wizard",
            attributes: [
                { name: "strength", value: 10 },
                { name: "dexterity", value: 10 },
                { name: "constitution", value: 10 },
                { name: "intelligence", value: 10 },
                { name: "wisdom", value: 10 },
                { name: "charisma", value: 10 },
            ],
        };

        const stored = normalizeStoredCharacter(legacy);

        expect(stored.resources.hp).toBe(5);
        expect(stored.selections.characterClass).toBe("wizard");
        expect(stored.baseStats).toBeDefined();
        expect(stored.modifiers).toEqual([]);
        expect(stored.grants).toEqual([]);
        expect(stored.language).toBe("en");
    });

    it("normalizes legacy subclass text into a catalog slug", () => {
        const stored = normalizeStoredCharacter({
            id: "legacy-subclass",
            type: "player",
            system: "dnd",
            name: "Subclass Hero",
            baseStats: {},
            modifiers: [],
            resources: { hp: 8 },
            systemData: {
                characterClass: "wizard",
                subclass: "Wizard-Evocation",
                level: 3,
            },
        });

        expect(stored.selections.characterClass).toBe("wizard");
        expect(stored.selections.subclass).toBe("wizard-evocation");
    });

    it("clears legacy subclass slugs that do not match the selected class", () => {
        const stored = normalizeStoredCharacter({
            id: "legacy-mismatch",
            type: "player",
            system: "dnd",
            name: "Mismatch Hero",
            baseStats: {},
            modifiers: [],
            resources: { hp: 8 },
            systemData: {
                characterClass: "wizard",
                subclass: "Fighter-Champion",
                level: 3,
            },
        });

        expect(stored.selections.characterClass).toBe("wizard");
        expect(stored.selections.subclass).toBeUndefined();
    });

    it("clears subclass when no parent class is selected", () => {
        const normalized = normalizeCharacterSelections(
            {
                race: undefined,
                subrace: undefined,
                characterClass: undefined,
                subclass: "wizard-evocation",
                background: undefined,
                inventory: emptyInventory(),
                choices: {},
            },
            {},
            "dnd"
        );

        expect(normalized.characterClass).toBeUndefined();
        expect(normalized.subclass).toBeUndefined();
    });
});
