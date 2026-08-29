import { createDefaultStats, emptyInventory } from "@rpv/domain";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import {
    buildBaseStatsFromForm,
    buildResourcesFromForm,
    buildSystemDataFromForm,
    getCoreFieldNames,
    getResourceMax,
} from "../lib/character/presetStats";

describe("getCoreFieldNames", () => {
    it("includes identity, grant sources, combat, and resource fields", () => {
        const names = getCoreFieldNames("dnd");

        expect(names.has("name")).toBe(true);
        expect(names.has("attributes")).toBe(true);
        expect(names.has("choices")).toBe(true);
        expect(names.has("inventory")).toBe(true);
        expect(names.has("race")).toBe(true);
        expect(names.has("subrace")).toBe(true);
        expect(names.has("characterClass")).toBe(true);
        expect(names.has("subclass")).toBe(true);
        expect(names.has("background")).toBe(true);
        expect(names.has("maxHp")).toBe(true);
        expect(names.has("hp")).toBe(true);
        expect(names.has("ac")).toBe(true);
    });

    it("leaves persona and progression fields out of the core set", () => {
        const names = getCoreFieldNames("dnd");

        expect(names.has("level")).toBe(false);
        expect(names.has("goals")).toBe(false);
        expect(names.has("personalityTraits")).toBe(false);
        expect(names.has("disposition")).toBe(false);
    });
});

describe("buildSystemDataFromForm", () => {
    it("keeps persona fields and strips core identity and combat fields", () => {
        expect(
            buildSystemDataFromForm(
                {
                    name: "Hero",
                    race: "elf",
                    characterClass: "wizard",
                    hp: 8,
                    maxHp: 10,
                    ac: 12,
                    attributes: [],
                    choices: {},
                    inventory: emptyInventory(),
                    level: 3,
                    goals: "Find the dragon",
                    personalityTraits: "Curious",
                },
                "dnd"
            )
        ).toEqual({
            level: 3,
            goals: "Find the dragon",
            personalityTraits: "Curious",
        });
    });
});

describe("buildBaseStatsFromForm", () => {
    it("coerces numeric strings, defaults blanks, and ignores unknown attributes", () => {
        const stats = buildBaseStatsFromForm(
            {
                attributes: [
                    { name: "strength", value: "14" },
                    { name: "dexterity", value: "" },
                    { name: "constitution", value: 12 },
                    { name: "intelligence" },
                    { name: "luck", value: 99 },
                    "not-an-object",
                ],
                maxHp: "20",
                ac: "",
            },
            "dnd"
        );

        expect(stats.strength).toBe(14);
        expect(stats.dexterity).toBe(10);
        expect(stats.constitution).toBe(12);
        expect(stats.intelligence).toBe(10);
        expect(stats.wisdom).toBe(10);
        expect(stats.charisma).toBe(10);
        expect(stats.hitPoints).toBe(20);
        expect(stats.armorClass).toBe(10);
    });

    it("uses combat and ability defaults when fields are missing", () => {
        const stats = buildBaseStatsFromForm({}, "dnd");

        expect(stats.strength).toBe(10);
        expect(stats.hitPoints).toBe(0);
        expect(stats.armorClass).toBe(10);
    });
});

describe("buildResourcesFromForm", () => {
    it("coerces hp from the form and falls back to the resource default", () => {
        expect(buildResourcesFromForm({ hp: "7" }, "dnd").hp).toBe(7);
        expect(buildResourcesFromForm({}, "dnd").hp).toBe(0);
        expect(buildResourcesFromForm({ hp: "" }, "dnd").hp).toBe(0);
        expect(buildResourcesFromForm({ hp: "nope" }, "dnd").hp).toBe(0);
    });
});

describe("getResourceMax", () => {
    const stored: StoredCharacter = {
        id: "preset-stats-resource-max",
        schemaVersion: 1,
        type: "player",
        system: "dnd",
        language: "en",
        name: "Hero",
        baseStats: createDefaultStats({ hitPoints: 22 }),
        modifiers: [],
        grants: [],
        selections: { inventory: emptyInventory(), choices: {} },
        resources: { hp: 10 },
        systemData: {},
    };

    it("returns resolved hitPoints for hp and derived maxima for class resources", () => {
        expect(getResourceMax(stored, "hp")).toBe(22);
        expect(getResourceMax(stored, "ki-points")).toBeUndefined();
        expect(
            getResourceMax(
                {
                    ...stored,
                    grants: [
                        {
                            id: "class-monk-ki",
                            kind: "resource",
                            ref: "ki-points",
                            amount: 5,
                            source: { type: "class", id: "monk" },
                        },
                    ],
                },
                "ki-points"
            )
        ).toBe(5);
    });

    it("uses resolved hitPoints including modifiers, not the base value", () => {
        expect(
            getResourceMax(
                {
                    ...stored,
                    modifiers: [
                        {
                            id: "item-hp",
                            stat: "hitPoints",
                            operation: "add",
                            value: 5,
                            source: { type: "item", id: "amulet" },
                            duration: { type: "permanent" },
                            stacking: "stack",
                            priority: 0,
                        },
                    ],
                },
                "hp"
            )
        ).toBe(27);
    });
});
