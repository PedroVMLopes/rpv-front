import { buildLevelGainSummary } from "../lib/character/buildLevelGainSummary";

function wizardForm(overrides: Record<string, unknown> = {}) {
    return {
        race: "human",
        characterClass: "wizard",
        level: 2,
        attributes: [
            { name: "strength", value: 8 },
            { name: "dexterity", value: 14 },
            { name: "constitution", value: 14 },
            { name: "intelligence", value: 16 },
            { name: "wisdom", value: 10 },
            { name: "charisma", value: 10 },
        ],
        ...overrides,
    };
}

function fighterForm(overrides: Record<string, unknown> = {}) {
    return {
        race: "human",
        characterClass: "fighter",
        level: 3,
        attributes: [
            { name: "strength", value: 16 },
            { name: "dexterity", value: 14 },
            { name: "constitution", value: 12 },
            { name: "intelligence", value: 10 },
            { name: "wisdom", value: 10 },
            { name: "charisma", value: 8 },
        ],
        ...overrides,
    };
}

describe("buildLevelGainSummary", () => {
    it("summarizes wizard level 2: HP 8→14, slot deltas, one spell pick, no subclass", () => {
        const summary = buildLevelGainSummary({
            formValues: wizardForm({ level: 2 }),
            featureLevel: 2,
            system: "dnd",
            contentLocale: "en",
        });

        expect(summary.hp).toEqual({ before: 8, after: 14 });
        expect(summary.classResources).toEqual(
            expect.arrayContaining([
                { ref: "spell-slots-1", amount: 1 },
                { ref: "spell-slots-2", amount: 1 },
            ])
        );
        expect(summary.classResources).toHaveLength(2);
        expect(summary.spellPicks).toEqual({ cantrips: 0, spells: 1 });
        expect(summary.subclassAvailable).toBe(false);
        expect(summary.subclassResources).toEqual([]);
    });

    it("marks subclass available for fighter at level 3 without counting skill picks as spells", () => {
        const summary = buildLevelGainSummary({
            formValues: fighterForm({ level: 3 }),
            featureLevel: 3,
            system: "dnd",
            contentLocale: "en",
        });

        expect(summary.subclassAvailable).toBe(true);
        expect(summary.spellPicks).toEqual({ cantrips: 0, spells: 0 });
        // d10, CON 12 (+1): L2=18, L3=25
        expect(summary.hp).toEqual({ before: 18, after: 25 });
        expect(summary.classResources).toEqual([]);
    });

    it("uses featureLevel for HP when form level is higher (creation mid-walk)", () => {
        const summary = buildLevelGainSummary({
            formValues: wizardForm({ level: 3 }),
            featureLevel: 2,
            system: "dnd",
            contentLocale: "en",
        });

        expect(summary.hp).toEqual({ before: 8, after: 14 });
    });

    it("includes subclass resources when subclass is selected and sourceTypes include subclass", () => {
        const summary = buildLevelGainSummary({
            formValues: fighterForm({
                level: 3,
                subclass: "fighter-champion",
            }),
            featureLevel: 3,
            system: "dnd",
            contentLocale: "en",
            sourceTypes: ["class", "subclass"],
        });

        expect(summary.subclassAvailable).toBe(true);
        // Champion L3 is ability-only in curation — no resource deltas
        expect(summary.subclassResources).toEqual([]);
    });
});
