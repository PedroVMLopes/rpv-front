import { resolveLevelUpSteps } from "../lib/character/creationSteps/resolveLevelUpSteps";

describe("resolveLevelUpSteps", () => {
    it("builds wizard 1→2 delta with spells and confirm, without creation shell", () => {
        const graph = resolveLevelUpSteps({
            formValues: {
                race: "human",
                characterClass: "wizard",
                level: 2,
            },
            fromLevel: 1,
            targetLevel: 2,
            system: "dnd",
            contentLocale: "en",
        });

        const ids = graph.steps.map((step) => step.id);

        expect(ids).toContain("class-level-2");
        expect(ids).toContain("class-level-2-spells");
        expect(ids.at(-1)).toBe("level-up-confirm");
        expect(ids).not.toContain("race");
        expect(ids).not.toContain("finalize");
        expect(ids).not.toContain("class-level-1");
        expect(ids).not.toContain("subclass");
    });

    it("builds fighter 2→3 with skill pick, subclass unlock, and confirm", () => {
        const graph = resolveLevelUpSteps({
            formValues: {
                race: "human",
                characterClass: "fighter",
                level: 3,
            },
            fromLevel: 2,
            targetLevel: 3,
            system: "dnd",
            contentLocale: "en",
        });

        const ids = graph.steps.map((step) => step.id);

        expect(ids).toContain("class-level-3");
        expect(ids).toContain("class-level-3-choices");
        expect(ids).toContain("subclass");
        expect(ids.at(-1)).toBe("level-up-confirm");
        expect(ids).not.toContain("race");
        expect(ids).not.toContain("abilities");
    });

    it("includes subclass level summary after champion is selected at L3", () => {
        const graph = resolveLevelUpSteps({
            formValues: {
                race: "human",
                characterClass: "fighter",
                subclass: "fighter-champion",
                level: 3,
            },
            fromLevel: 2,
            targetLevel: 3,
            system: "dnd",
            contentLocale: "en",
        });

        const ids = graph.steps.map((step) => step.id);

        expect(ids).toContain("subclass");
        expect(ids).toContain("subclass-level-3");
        expect(ids.at(-1)).toBe("level-up-confirm");
    });

    it("builds fighter 1→2 summary-only plus confirm", () => {
        const graph = resolveLevelUpSteps({
            formValues: {
                race: "human",
                characterClass: "fighter",
                level: 2,
            },
            fromLevel: 1,
            targetLevel: 2,
            system: "dnd",
            contentLocale: "en",
        });

        const ids = graph.steps.map((step) => step.id);

        expect(ids).toEqual(["class-level-2", "level-up-confirm"]);
    });

    it("includes prepare-spells before confirm when wizard book has leveled spells", () => {
        const graph = resolveLevelUpSteps({
            formValues: {
                race: "human",
                characterClass: "wizard",
                level: 2,
                choices: {
                    grantPicks: {
                        "class:wizard:1:spell:2:0": "burning-hands",
                        "class:wizard:1:spell:2:1": "magic-missile",
                    },
                    preparedSpells: [],
                },
            },
            fromLevel: 1,
            targetLevel: 2,
            system: "dnd",
            contentLocale: "en",
        });

        const ids = graph.steps.map((step) => step.id);
        const prepareIndex = ids.indexOf("prepare-spells");
        const confirmIndex = ids.indexOf("level-up-confirm");

        expect(prepareIndex).toBeGreaterThan(-1);
        expect(confirmIndex).toBe(ids.length - 1);
        expect(prepareIndex).toBe(confirmIndex - 1);
        expect(graph.getStep("prepare-spells")?.macroGroupId).toBe("spells");
    });

    it("omits prepare-spells on fighter level-up", () => {
        const graph = resolveLevelUpSteps({
            formValues: {
                race: "human",
                characterClass: "fighter",
                level: 2,
            },
            fromLevel: 1,
            targetLevel: 2,
            system: "dnd",
            contentLocale: "en",
        });

        expect(graph.steps.some((step) => step.id === "prepare-spells")).toBe(
            false
        );
    });
});
