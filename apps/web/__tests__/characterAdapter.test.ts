import {
    flattenStoredToForm,
    formDataToStoredCharacter,
    normalizeStoredCharacter,
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
        expect(stored.systemData.characterClass).toBe("Fighter");
        expect(stored.systemData.level).toBe(3);
        expect(stored.systemData.goals).toBe("Find the dragon");
        expect(stored.baseStats.strength).toBe(14);
        expect(stored.baseStats.hitPoints).toBe(10);
        expect(stored.baseStats.armorClass).toBe(12);
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
        expect(flattened.characterClass).toBe("Fighter");
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
        expect(stored.systemData.characterClass).toBe("Wizard");
        expect(stored.baseStats).toBeDefined();
        expect(stored.modifiers).toEqual([]);
        expect(stored.language).toBe("en");
    });
});
