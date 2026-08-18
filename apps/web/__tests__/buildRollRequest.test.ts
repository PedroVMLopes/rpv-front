import {
    buildAbilityCheckRollRequest,
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
            },
            "Athletics"
        );

        expect(request).toEqual({
            kind: "d20_test",
            id: "skill:athletics",
            label: "Athletics",
            die: 20,
            modifier: 5,
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
                },
                14
            )
        ).toBe(19);
    });
});
