import { emptyInventory } from "@rpv/domain";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import { listOverviewTraitGroups } from "../lib/character/overviewTraits";

function baseStored(overrides: Partial<StoredCharacter> = {}): StoredCharacter {
    return {
        id: "overview-traits-1",
        schemaVersion: 1,
        type: "player",
        system: "dnd",
        language: "en",
        name: "Hero",
        baseStats: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
            armorClass: 10,
            hitPoints: 10,
        },
        modifiers: [],
        grants: [],
        selections: {
            race: "elf",
            subrace: "high-elf",
            characterClass: "fighter",
            choices: {},
            inventory: emptyInventory(),
        },
        resources: { hp: 10 },
        systemData: { level: 2 },
        ...overrides,
    };
}

describe("listOverviewTraitGroups", () => {
    it("lists catalog race traits and class abilities without duplicating race grants", () => {
        const groups = listOverviewTraitGroups(
            baseStored({
                grants: [
                    {
                        id: "race-elf-base-ability-Fey Ancestry",
                        kind: "ability",
                        ref: "Fey Ancestry",
                        name: "Fey Ancestry",
                        source: { type: "race", id: "elf" },
                    },
                    {
                        id: "class-fighter-2-ability-Action Surge",
                        kind: "ability",
                        ref: "Action Surge",
                        name: "Action Surge",
                        source: { type: "class", id: "fighter" },
                    },
                ],
            }),
            "en"
        );

        const raceGroup = groups.find((group) => group.sourceType === "race");
        const classGroup = groups.find((group) => group.sourceType === "class");

        expect(raceGroup?.traits.some((trait) => trait.slug === "fey-ancestry")).toBe(
            true
        );
        expect(raceGroup?.traits.some((trait) => trait.slug === "vision")).toBe(
            true
        );
        expect(
            raceGroup?.traits.filter((trait) => trait.name === "Fey Ancestry")
        ).toHaveLength(1);

        expect(classGroup?.traits).toEqual([
            expect.objectContaining({
                name: "Action Surge",
                description: expect.stringMatching(/additional action/i),
            }),
        ]);
    });

    it("omits race ability grants when the catalog has no traits", () => {
        const groups = listOverviewTraitGroups(
            baseStored({
                selections: {
                    characterClass: "fighter",
                    choices: {},
                    inventory: emptyInventory(),
                },
                grants: [
                    {
                        id: "race-human-ability-unused",
                        kind: "ability",
                        ref: "Extra Language",
                        name: "Extra Language",
                        source: { type: "race", id: "human" },
                    },
                ],
            }),
            "en"
        );

        expect(groups.some((group) => group.sourceType === "race")).toBe(false);
        expect(
            groups.flatMap((group) => group.traits).map((trait) => trait.name)
        ).not.toContain("Extra Language");
    });

    it("omits system combat abilities from Features & Traits", () => {
        const groups = listOverviewTraitGroups(
            baseStored({
                grants: [
                    {
                        id: "system-dnd-basic-combat-base-ability-Dash",
                        kind: "ability",
                        ref: "Dash",
                        name: "Dash",
                        source: { type: "system", id: "dnd-basic-combat" },
                        activation: { cost: "action" },
                    },
                    {
                        id: "class-fighter-2-ability-Action Surge",
                        kind: "ability",
                        ref: "Action Surge",
                        name: "Action Surge",
                        source: { type: "class", id: "fighter" },
                    },
                ],
            }),
            "en"
        );

        expect(groups.some((group) => group.sourceType === "system")).toBe(
            false
        );
        expect(
            groups.flatMap((group) => group.traits).map((trait) => trait.name)
        ).not.toContain("Dash");
        expect(
            groups
                .find((group) => group.sourceType === "class")
                ?.traits.map((trait) => trait.name)
        ).toContain("Action Surge");
    });
});
