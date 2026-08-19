import type { Stats } from "@rpv/domain";
import {
    buildActionsStatusSummary,
    buildDisplayActions,
    filterDisplayActions,
    groupDisplayActions,
} from "../lib/character/actionDisplay";
import type { StoredCharacter } from "../lib/character/storedCharacter";

const resolved: Stats = {
    strength: 16,
    dexterity: 14,
    constitution: 12,
    intelligence: 10,
    wisdom: 10,
    charisma: 8,
    armorClass: 16,
    hitPoints: 20,
};

const stored: StoredCharacter = {
    id: "actions-display-test",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Action Tester",
    baseStats: resolved,
    modifiers: [],
    grants: [
        {
            id: "class-fighter-resource-second-wind-uses",
            kind: "resource",
            ref: "second-wind-uses",
            amount: 1,
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-ability-second-wind",
            kind: "ability",
            ref: "Second Wind",
            name: "Second Wind",
            source: { type: "class", id: "fighter" },
            activation: { cost: "bonus", resourceRef: "second-wind-uses" },
        },
        {
            id: "class-barbarian-ability-danger-sense",
            kind: "ability",
            ref: "Danger Sense",
            name: "Danger Sense",
            source: { type: "class", id: "barbarian" },
            activation: { cost: "passive" },
        },
        {
            id: "background-guild-artisan-ability-guild-membership",
            kind: "ability",
            ref: "Guild Membership",
            name: "Guild Membership",
            source: { type: "background", id: "guild-artisan" },
        },
        {
            id: "class-wizard-spell-fire-bolt",
            kind: "spell",
            ref: "fire-bolt",
            name: "Fire Bolt",
            source: { type: "class", id: "wizard" },
        },
        {
            id: "class-wizard-spell-burning-hands",
            kind: "spell",
            ref: "burning-hands",
            name: "Burning Hands",
            source: { type: "class", id: "wizard" },
        },
    ],
    selections: {
        characterClass: "fighter",
        choices: {
            preparedSpells: ["burning-hands"],
        },
        inventory: {
            bag: [{ slug: "srd_longsword", quantity: 1 }],
            equipped: { "melee-main": "srd_longsword" },
        },
    },
    resources: {
        hp: 18,
        "second-wind-uses": 0,
        "spell-slots-1": 2,
    },
    systemData: {
        characterClass: "fighter",
        level: 2,
    },
};

describe("actionDisplay", () => {
    it("groups actions by action economy and keeps passive reminders separate", () => {
        const actions = buildDisplayActions(stored, resolved, "en", () => "Main hand");
        const groups = groupDisplayActions(actions);

        expect(groups.map((group) => group.cost)).toEqual([
            "action",
            "bonus",
            "passive",
        ]);
        expect(groups.find((group) => group.cost === "bonus")?.actions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: "Second Wind" }),
            ])
        );
        expect(groups.find((group) => group.cost === "passive")?.actions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: "Danger Sense" }),
            ])
        );
        expect(actions.map((action) => action.title)).not.toContain(
            "Guild Membership"
        );
    });

    it("marks depleted feature resources and filters available actions", () => {
        const actions = buildDisplayActions(stored, resolved, "en", () => "Main hand");
        const secondWind = actions.find((action) => action.title === "Second Wind");

        expect(secondWind).toEqual(
            expect.objectContaining({
                availability: "depleted",
                resource: expect.objectContaining({
                    ref: "second-wind-uses",
                    current: 0,
                    max: 1,
                }),
            })
        );

        expect(
            filterDisplayActions(actions, "available").map((action) => action.title)
        ).not.toContain("Second Wind");
    });

    it("builds a status rail summary from resolved stats and current resources", () => {
        const summary = buildActionsStatusSummary(stored, resolved, "en", 18);

        expect(summary.currentHp).toBe(18);
        expect(summary.maxHp).toBe(20);
        expect(summary.armorClass).toBe(16);
        expect(summary.resources).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    ref: "spell-slots-1",
                    current: 2,
                    max: 2,
                }),
            ])
        );
    });
});
