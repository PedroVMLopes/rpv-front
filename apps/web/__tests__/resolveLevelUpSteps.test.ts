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
        expect(ids).not.toContain("equipment");
        expect(ids).not.toContain("review");
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
        const subclassLevel3 = graph.getStep("subclass-level-3");

        expect(ids).toContain("subclass");
        expect(ids).toContain("subclass-level-3");
        expect(subclassLevel3?.kind).toBe("level_summary");
        expect(subclassLevel3?.labelKey).toBe("steps.levelUnlocks");
        expect(subclassLevel3?.labelValues).toEqual({ level: 3 });
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
        const classLevel2 = graph.getStep("class-level-2");

        expect(ids).toEqual(["class-level-2", "level-up-confirm"]);
        expect(classLevel2?.kind).toBe("level_summary");
        expect(classLevel2?.labelKey).toBe("steps.levelUnlocks");
        expect(classLevel2?.labelValues).toEqual({ level: 2 });
    });

    it("includes ASI grant picks on fighter 3→4 level-up, not at L1 create", () => {
        const levelUp = resolveLevelUpSteps({
            formValues: {
                race: "human",
                characterClass: "fighter",
                level: 4,
            },
            fromLevel: 3,
            targetLevel: 4,
            system: "dnd",
            contentLocale: "en",
        });

        expect(levelUp.steps.map((step) => step.id)).toEqual(
            expect.arrayContaining(["class-level-4", "class-level-4-choices"])
        );

        const fromL1 = resolveLevelUpSteps({
            formValues: {
                race: "human",
                characterClass: "fighter",
                level: 1,
            },
            fromLevel: 1,
            targetLevel: 1,
            system: "dnd",
            contentLocale: "en",
        });

        expect(fromL1.steps.some((step) => step.id === "class-level-4")).toBe(
            false
        );
        expect(
            fromL1.steps.some((step) =>
                step.id.includes("ability_score")
            )
        ).toBe(false);
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

    it("includes rogue expertise picks when leveling to 6", () => {
        const graph = resolveLevelUpSteps({
            formValues: {
                race: "human",
                characterClass: "rogue",
                level: 6,
            },
            fromLevel: 5,
            targetLevel: 6,
            system: "dnd",
            contentLocale: "en",
        });

        const ids = graph.steps.map((step) => step.id);

        expect(ids).toContain("class-level-6");
        expect(ids).toContain("class-level-6-expertise");
        expect(ids).not.toContain("class-level-1-expertise");
    });
});
