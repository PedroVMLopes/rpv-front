import type { Grant } from "@rpv/content";
import type { PendingChoiceGrant } from "../lib/character/grantChoices";
import {
    filterChoicesForStep,
    matchesGrantForFilter,
    matchesGrantSourceTypes,
    matchesStepSourceFilter,
} from "../lib/character/creationSteps/stepFilters";

function choice(
    overrides: Partial<PendingChoiceGrant> &
        Pick<PendingChoiceGrant, "key" | "grant">
): PendingChoiceGrant {
    return {
        source: { type: "class", id: "wizard" },
        label: overrides.key,
        options: [],
        ...overrides,
    };
}

const cantripGrant: Grant = {
    grantType: "spell",
    choose: 3,
    selectionFilter: { levelInt: 0 },
};

const leveledGrant: Grant = {
    grantType: "spell",
    choose: 2,
    selectionFilter: { levelIntMax: 1 },
};

const skillGrant: Grant = {
    grantType: "skill_proficiency",
    choose: 1,
};

describe("matchesGrantSourceTypes", () => {
    it("matches all sources when the type list is empty or omitted", () => {
        expect(
            matchesGrantSourceTypes({ type: "race", id: "elf" })
        ).toBe(true);
        expect(
            matchesGrantSourceTypes({ type: "class", id: "wizard" }, [])
        ).toBe(true);
    });

    it("requires the source type to be listed", () => {
        expect(
            matchesGrantSourceTypes({ type: "class", id: "wizard" }, [
                "class",
                "subclass",
            ])
        ).toBe(true);
        expect(
            matchesGrantSourceTypes({ type: "race", id: "elf" }, ["class"])
        ).toBe(false);
    });
});

describe("matchesStepSourceFilter", () => {
    const wizardCantrip = choice({
        key: "class:wizard:1:spell:1:0",
        grant: cantripGrant,
    });
    const wizardLeveled = choice({
        key: "class:wizard:1:spell:2:0",
        grant: leveledGrant,
    });
    const racialCantrip = choice({
        key: "race:high-elf:base:spell:0:0",
        grant: cantripGrant,
        source: { type: "race", id: "high-elf" },
    });
    const fighterL3Skill = choice({
        key: "class:fighter:3:skill_proficiency:0:0",
        grant: skillGrant,
        source: { type: "class", id: "fighter" },
    });

    it("matches everything when no filter is provided", () => {
        expect(matchesStepSourceFilter(wizardCantrip)).toBe(true);
    });

    it("filters by source type, feature level, grant type, and spell tier", () => {
        expect(
            matchesStepSourceFilter(wizardCantrip, {
                sourceTypes: ["class"],
                level: 1,
                grantTypes: ["spell"],
                spellTier: "cantrip",
            })
        ).toBe(true);
        expect(
            matchesStepSourceFilter(wizardLeveled, {
                sourceTypes: ["class"],
                level: 1,
                spellTier: "cantrip",
            })
        ).toBe(false);
        expect(
            matchesStepSourceFilter(wizardLeveled, {
                sourceTypes: ["class"],
                level: 1,
                spellTier: "leveled",
            })
        ).toBe(true);
        expect(
            matchesStepSourceFilter(racialCantrip, {
                sourceTypes: ["class"],
                spellTier: "cantrip",
            })
        ).toBe(false);
        expect(
            matchesStepSourceFilter(fighterL3Skill, {
                sourceTypes: ["class"],
                level: 1,
            })
        ).toBe(false);
        expect(
            matchesStepSourceFilter(fighterL3Skill, {
                sourceTypes: ["class"],
                level: 3,
                grantTypes: ["spell"],
            })
        ).toBe(false);
    });
});

describe("filterChoicesForStep", () => {
    it("keeps only choices that match the step filter", () => {
        const choices = [
            choice({
                key: "class:wizard:1:spell:1:0",
                grant: cantripGrant,
            }),
            choice({
                key: "class:wizard:1:spell:2:0",
                grant: leveledGrant,
            }),
            choice({
                key: "race:high-elf:base:spell:0:0",
                grant: cantripGrant,
                source: { type: "race", id: "high-elf" },
            }),
        ];

        expect(
            filterChoicesForStep(choices, {
                sourceTypes: ["class"],
                level: 1,
                spellTier: "cantrip",
            }).map((entry) => entry.key)
        ).toEqual(["class:wizard:1:spell:1:0"]);
    });
});

describe("matchesGrantForFilter", () => {
    it("matches all grants when grantTypes is omitted", () => {
        expect(matchesGrantForFilter(skillGrant)).toBe(true);
        expect(matchesGrantForFilter(cantripGrant, {})).toBe(true);
    });

    it("requires the grant type to be listed", () => {
        expect(
            matchesGrantForFilter(cantripGrant, { grantTypes: ["spell"] })
        ).toBe(true);
        expect(
            matchesGrantForFilter(skillGrant, { grantTypes: ["spell"] })
        ).toBe(false);
    });
});
