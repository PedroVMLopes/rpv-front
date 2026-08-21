import type { FieldConfig } from "../components/forms/DynamicForm";
import { resolveCreationSteps } from "../lib/character/creationSteps/resolveCreationSteps";
import {
    buildPlayerGrantSourceFields,
    filterPlayerFormFields,
    getVisiblePlayerFields,
} from "../lib/character/playerFormFields";

const fields: FieldConfig[] = [
    { name: "name", type: "text" },
    { name: "race", type: "select" },
    { name: "subrace", type: "select" },
    { name: "characterClass", type: "select" },
    { name: "subclass", type: "select" },
    { name: "level", type: "number" },
    { name: "hp", type: "number" },
    { name: "maxHp", type: "number" },
    { name: "ac", type: "number" },
    { name: "attributes", type: "attributeGroup" },
    { name: "background", type: "select" },
];

describe("buildPlayerGrantSourceFields", () => {
    it("locks subclass below the class subclass level and unlocks at that level", () => {
        const locked = buildPlayerGrantSourceFields(fields, {
            classSlug: "fighter",
            level: 2,
            contentLocale: "en",
        }).find((field) => field.name === "subclass");

        expect(locked?.disabled).toBe(true);
        expect(locked?.helperKey).toBe("fields.subclassLocked");
        expect(locked?.helperValues).toEqual({ level: 3 });
        expect((locked?.options ?? []).length).toBeGreaterThan(0);

        const unlocked = buildPlayerGrantSourceFields(fields, {
            classSlug: "fighter",
            level: 3,
            contentLocale: "en",
        }).find((field) => field.name === "subclass");

        expect(unlocked?.disabled).toBe(false);
        expect(unlocked?.helperKey).toBeUndefined();
    });
});

describe("filterPlayerFormFields", () => {
    it("drops combat overrides and the attribute group", () => {
        expect(filterPlayerFormFields(fields).map((field) => field.name)).toEqual(
            [
                "name",
                "race",
                "subrace",
                "characterClass",
                "subclass",
                "level",
                "background",
            ]
        );
    });
});

describe("getVisiblePlayerFields", () => {
    it("hides subrace on the race step when the race has none", () => {
        const graph = resolveCreationSteps({
            formValues: { race: "human" },
            system: "dnd",
            contentLocale: "en",
        });

        expect(
            getVisiblePlayerFields(fields, "race", graph, {
                raceSlug: "human",
                contentLocale: "en",
            }).map((field) => field.name)
        ).toEqual(["race"]);
    });

    it("keeps subrace on the race step when the race has options", () => {
        const graph = resolveCreationSteps({
            formValues: { race: "elf" },
            system: "dnd",
            contentLocale: "en",
        });

        expect(
            getVisiblePlayerFields(fields, "race", graph, {
                raceSlug: "elf",
                contentLocale: "en",
            }).map((field) => field.name)
        ).toEqual(["race", "subrace"]);
    });

    it("keeps only class and level on the class step", () => {
        const graph = resolveCreationSteps({
            formValues: { race: "human", characterClass: "fighter" },
            system: "dnd",
            contentLocale: "en",
        });

        expect(
            getVisiblePlayerFields(fields, "class", graph, {
                raceSlug: "human",
                contentLocale: "en",
            }).map((field) => field.name)
        ).toEqual(["characterClass", "level"]);
    });
});
