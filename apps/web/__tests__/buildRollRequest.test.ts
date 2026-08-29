import {
    buildAbilityCheckRollRequest,
    buildDeathSaveRollRequest,
    buildHitDieRollRequest,
    buildSavingThrowRollRequest,
    buildSkillRollRequest,
    resolveD20TestTotal,
} from "../lib/roll/buildRollRequest";

describe("buildRollRequest", () => {
    it("builds a skill d20 test request", () => {
        const request = buildSkillRollRequest(
            {
                slug: "athletics",
                name: "Athletics",
                ability: "strength",
                modifier: 5,
                proficient: true,
                proficiencyScale: 1,
            },
            "Athletics"
        );

        expect(request).toEqual({
            kind: "d20_test",
            id: "skill:athletics",
            label: "Athletics",
            die: 20,
            modifier: 5,
            appliesTo: "ability_check",
        });
    });

    it("builds a saving throw d20 test request", () => {
        const request = buildSavingThrowRollRequest(
            {
                stat: "strength",
                modifier: 4,
                proficient: true,
            },
            "Strength"
        );

        expect(request).toEqual({
            kind: "d20_test",
            id: "save:strength",
            label: "Strength",
            die: 20,
            modifier: 4,
            appliesTo: "save",
        });
    });

    it("builds an ability check d20 test request", () => {
        const request = buildAbilityCheckRollRequest(
            "strength",
            "Strength",
            3
        );

        expect(request).toEqual({
            kind: "d20_test",
            id: "ability:strength",
            label: "Strength",
            die: 20,
            modifier: 3,
            appliesTo: "ability_check",
        });
    });

    it("builds a death save d20 request", () => {
        expect(buildDeathSaveRollRequest("hero-1", "Death saves")).toEqual({
            kind: "death_save",
            id: "death-save:hero-1",
            label: "Death saves",
            characterId: "hero-1",
            die: 20,
        });
    });

    it("builds a hit die request", () => {
        expect(buildHitDieRollRequest("hero-1", "Hit dice", 10)).toEqual({
            kind: "hit_die",
            id: "hit-die:hero-1",
            label: "Hit dice",
            characterId: "hero-1",
            die: 10,
        });
    });
});

describe("resolveD20TestTotal", () => {
    it("adds die value and modifier", () => {
        expect(
            resolveD20TestTotal(
                {
                    kind: "d20_test",
                    id: "skill:athletics",
                    label: "Athletics",
                    die: 20,
                    modifier: 5,
                    appliesTo: "ability_check",
                },
                14
            )
        ).toBe(19);
    });
});
