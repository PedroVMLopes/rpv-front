import { resolveCreationSteps } from "../lib/character/creationSteps/resolveCreationSteps";

describe("resolveCreationSteps", () => {
    it("starts with race for an empty form", () => {
        const graph = resolveCreationSteps({
            formValues: {},
            system: "dnd",
            contentLocale: "en",
        });

        expect(graph.steps[0]?.id).toBe("race");
        expect(graph.steps.at(-1)?.id).toBe("finalize");
        expect(graph.macroGroups.map((group) => group.id)).toEqual([
            "levelUp",
            "race",
            "class",
            "background",
            "abilities",
            "spells",
            "finalize",
        ]);
    });

    it("omits subrace for human", () => {
        const graph = resolveCreationSteps({
            formValues: { race: "human" },
            system: "dnd",
            contentLocale: "en",
        });

        expect(graph.steps.some((step) => step.id === "subrace")).toBe(false);
    });

    it("includes subrace for elf", () => {
        const graph = resolveCreationSteps({
            formValues: { race: "elf" },
            system: "dnd",
            contentLocale: "en",
        });

        expect(graph.steps.some((step) => step.id === "subrace")).toBe(true);
    });

    it("includes high elf cantrip step and wizard class level steps at L3", () => {
        const graph = resolveCreationSteps({
            formValues: {
                race: "elf",
                subrace: "high-elf",
                characterClass: "wizard",
                level: 3,
            },
            system: "dnd",
            contentLocale: "en",
        });

        expect(graph.steps.some((step) => step.id === "race-cantrips")).toBe(
            true
        );
        expect(graph.steps.some((step) => step.id === "class-level-1")).toBe(
            false
        );
        expect(
            graph.steps.some((step) => step.id === "class-level-1-cantrips")
        ).toBe(true);
        expect(
            graph.steps.some((step) => step.id === "class-level-1-spells")
        ).toBe(true);
        expect(graph.steps.some((step) => step.id === "class-level-2")).toBe(
            true
        );
        expect(graph.steps.some((step) => step.id === "class-level-3")).toBe(
            true
        );
        expect(graph.steps.some((step) => step.id === "subclass")).toBe(true);
    });

    it("includes fighter level steps without spell pick steps at L1", () => {
        const graph = resolveCreationSteps({
            formValues: {
                race: "human",
                characterClass: "fighter",
                level: 1,
            },
            system: "dnd",
            contentLocale: "en",
        });

        expect(graph.steps.some((step) => step.id === "class-level-1")).toBe(
            false
        );
        expect(
            graph.steps.some((step) => step.id.includes("cantrips"))
        ).toBe(false);
        expect(
            graph.steps.some((step) => step.id === "class-level-1-choices")
        ).toBe(true);
        expect(graph.steps.some((step) => step.id === "subclass")).toBe(false);
    });

    it("caps interactive class level steps at 3 when character level is 5", () => {
        const graph = resolveCreationSteps({
            formValues: {
                race: "human",
                characterClass: "wizard",
                level: 5,
            },
            system: "dnd",
            contentLocale: "en",
        });

        expect(graph.steps.some((step) => step.id === "class-level-3")).toBe(
            true
        );
        expect(graph.steps.some((step) => step.id === "class-level-4")).toBe(
            false
        );
        expect(graph.steps.some((step) => step.id === "subclass")).toBe(true);
    });

    it("always includes informative class-level-2 for wizard L3", () => {
        const graph = resolveCreationSteps({
            formValues: {
                race: "human",
                characterClass: "wizard",
                level: 3,
            },
            system: "dnd",
            contentLocale: "en",
        });

        const level2 = graph.getStep("class-level-2");

        expect(level2?.kind).toBe("level_summary");
    });

    it("omits subclass level steps when subclass only has base grants", () => {
        const graph = resolveCreationSteps({
            formValues: {
                race: "human",
                characterClass: "wizard",
                subclass: "wizard-evocation",
                level: 3,
            },
            system: "dnd",
            contentLocale: "en",
        });

        expect(
            graph.steps.some((step) => step.id.startsWith("subclass-level-"))
        ).toBe(false);
    });

    it("includes subclass level summary only for levels with features", () => {
        const graph = resolveCreationSteps({
            formValues: {
                race: "human",
                characterClass: "fighter",
                subclass: "fighter-champion",
                level: 3,
            },
            system: "dnd",
            contentLocale: "en",
        });

        expect(
            graph.steps.some((step) => step.id === "subclass-level-1")
        ).toBe(false);
        expect(
            graph.steps.some((step) => step.id === "subclass-level-2")
        ).toBe(false);
        expect(
            graph.steps.some((step) => step.id === "subclass-level-3")
        ).toBe(true);
    });

    it("includes prepare-spells after abilities when wizard has leveled spells in book", () => {
        const graph = resolveCreationSteps({
            formValues: {
                race: "human",
                characterClass: "wizard",
                level: 1,
                choices: {
                    grantPicks: {
                        "class:wizard:1:spell:2:0": "burning-hands",
                        "class:wizard:1:spell:2:1": "magic-missile",
                    },
                    preparedSpells: [],
                },
            },
            system: "dnd",
            contentLocale: "en",
        });

        const ids = graph.steps.map((step) => step.id);
        const abilitiesIndex = ids.indexOf("abilities");
        const prepareIndex = ids.indexOf("prepare-spells");
        const finalizeIndex = ids.indexOf("finalize");

        expect(prepareIndex).toBeGreaterThan(abilitiesIndex);
        expect(finalizeIndex).toBeGreaterThan(prepareIndex);
        expect(graph.getStep("prepare-spells")?.kind).toBe("prepare_spells");
        expect(graph.getStep("prepare-spells")?.macroGroupId).toBe("spells");
    });

    it("omits prepare-spells for fighter", () => {
        const graph = resolveCreationSteps({
            formValues: {
                race: "human",
                characterClass: "fighter",
                level: 1,
            },
            system: "dnd",
            contentLocale: "en",
        });

        expect(graph.steps.some((step) => step.id === "prepare-spells")).toBe(
            false
        );
    });

    it("omits prepare-spells for wizard when book has only cantrips", () => {
        const graph = resolveCreationSteps({
            formValues: {
                race: "human",
                characterClass: "wizard",
                level: 1,
                choices: {
                    grantPicks: {
                        "class:wizard:1:spell:1:0": "acid-splash",
                        "class:wizard:1:spell:1:1": "mage-hand",
                        "class:wizard:1:spell:1:2": "prestidigitation",
                    },
                },
            },
            system: "dnd",
            contentLocale: "en",
        });

        expect(graph.steps.some((step) => step.id === "prepare-spells")).toBe(
            false
        );
    });
});
