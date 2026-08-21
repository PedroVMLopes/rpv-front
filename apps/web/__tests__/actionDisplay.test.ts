import type { Stats } from "@rpv/domain";
import {
    buildActionsStatusSummary,
    buildDisplayActions,
    DEFAULT_ACTION_FILTER_STATE,
    filterDisplayActions,
    groupDisplayActions,
    listCombatReminders,
    toggleActionFilterCategory,
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
        ]);
        expect(groups.find((group) => group.cost === "bonus")?.actions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: "Second Wind" }),
            ])
        );
        expect(actions.map((action) => action.title)).not.toContain(
            "Danger Sense"
        );
        expect(actions.map((action) => action.title)).not.toContain(
            "Guild Membership"
        );
        expect(listCombatReminders(stored, "en")).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: "Danger Sense" }),
            ])
        );
        expect(listCombatReminders(stored, "en").map((action) => action.title))
            .not.toContain("Guild Membership");
    });

    it("always lists unarmed strike as a weapon action", () => {
        const withWeapon = buildDisplayActions(
            stored,
            resolved,
            "en",
            () => "Main hand"
        );
        const unarmed = withWeapon.find(
            (action) => action.title === "Unarmed Strike"
        );

        expect(unarmed).toEqual(
            expect.objectContaining({
                sourceType: "weapon",
                actionCost: "action",
                weapon: expect.objectContaining({
                    slug: "unarmed-strike",
                    slotId: "natural",
                    attackModifier: 5,
                    damageBase: 1,
                    damageFlat: 3,
                    damageType: "bludgeoning",
                }),
            })
        );
        expect(unarmed?.weapon?.damage).toBe("1+3 bludgeoning");
        expect(
            filterDisplayActions(withWeapon, {
                weapons: true,
                spells: false,
                abilities: false,
            }).map((action) => action.title)
        ).toEqual(expect.arrayContaining(["Longsword", "Unarmed Strike"]));

        const unequipped: StoredCharacter = {
            ...stored,
            selections: {
                ...stored.selections,
                inventory: { bag: [], equipped: {} },
            },
        };
        const withoutWeapon = buildDisplayActions(
            unequipped,
            resolved,
            "en",
            () => "Main hand"
        );

        expect(
            withoutWeapon.map((action) => action.title)
        ).toContain("Unarmed Strike");
        expect(
            withoutWeapon.map((action) => action.title)
        ).not.toContain("Longsword");
    });

    it("excludes equipped shield from the attack action list", () => {
        const withShield: StoredCharacter = {
            ...stored,
            selections: {
                ...stored.selections,
                inventory: {
                    bag: [
                        { slug: "srd_longsword", quantity: 1 },
                        { slug: "srd_shield", quantity: 1 },
                    ],
                    equipped: {
                        "melee-main": "srd_longsword",
                        "melee-off": "srd_shield",
                    },
                },
            },
        };

        const actions = buildDisplayActions(
            withShield,
            resolved,
            "en",
            () => "Main hand"
        );
        const titles = actions.map((action) => action.title);

        expect(titles).toContain("Longsword");
        expect(titles).toContain("Unarmed Strike");
        expect(titles).not.toContain("Shield");
    });

    it("lists system combat features in action and reaction groups, not reminders or overview", () => {
        const withSystem: StoredCharacter = {
            ...stored,
            grants: [
                ...(stored.grants ?? []),
                {
                    id: "system-dnd-basic-combat-base-ability-Dash",
                    kind: "ability",
                    ref: "Dash",
                    name: "Dash",
                    source: { type: "system", id: "dnd-basic-combat" },
                    activation: { cost: "action" },
                },
                {
                    id: "system-dnd-basic-combat-base-ability-Opportunity Attack",
                    kind: "ability",
                    ref: "Opportunity Attack",
                    name: "Opportunity Attack",
                    source: { type: "system", id: "dnd-basic-combat" },
                    activation: { cost: "reaction" },
                },
            ],
        };

        const actions = buildDisplayActions(
            withSystem,
            resolved,
            "en",
            () => "Main hand"
        );
        const groups = groupDisplayActions(actions);

        expect(
            groups.find((group) => group.cost === "action")?.actions
        ).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: "Dash" }),
            ])
        );
        expect(
            groups.find((group) => group.cost === "reaction")?.actions
        ).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: "Opportunity Attack" }),
            ])
        );
        expect(
            listCombatReminders(withSystem, "en").map((action) => action.title)
        ).not.toContain("Dash");
        expect(
            listCombatReminders(withSystem, "en").map((action) => action.title)
        ).not.toContain("Opportunity Attack");
    });

    it("marks depleted feature resources", () => {
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
    });

    it("puts a spendable bonus ability in the Actions catalog, not Reminders", () => {
        const character: StoredCharacter = {
            ...stored,
            grants: [
                {
                    id: "class-example-resource-burst-uses",
                    kind: "resource",
                    ref: "burst-uses",
                    amount: 3,
                    source: { type: "class", id: "example" },
                },
                {
                    id: "class-example-ability-spendable-burst",
                    kind: "ability",
                    ref: "Spendable Burst",
                    name: "Spendable Burst",
                    source: { type: "class", id: "example" },
                    activation: { cost: "bonus", resourceRef: "burst-uses" },
                },
            ],
            resources: { hp: 18, "burst-uses": 2 },
        };

        const actions = buildDisplayActions(
            character,
            resolved,
            "en",
            () => "Main hand"
        );
        const groups = groupDisplayActions(actions);
        const burst = groups
            .find((group) => group.cost === "bonus")
            ?.actions.find((action) => action.title === "Spendable Burst");

        expect(burst).toEqual(
            expect.objectContaining({
                title: "Spendable Burst",
                resource: expect.objectContaining({
                    ref: "burst-uses",
                    current: 2,
                    max: 3,
                }),
            })
        );
        expect(
            listCombatReminders(character, "en").map((action) => action.title)
        ).not.toContain("Spendable Burst");
    });

    it("puts a passive-only ability in Reminders, not the Actions catalog", () => {
        const character: StoredCharacter = {
            ...stored,
            grants: [
                {
                    id: "class-example-ability-on-hit-rider",
                    kind: "ability",
                    ref: "On-hit Rider",
                    name: "On-hit Rider",
                    source: { type: "class", id: "example" },
                    activation: { cost: "passive" },
                },
            ],
        };

        const actions = buildDisplayActions(
            character,
            resolved,
            "en",
            () => "Main hand"
        );

        expect(actions.map((action) => action.title)).not.toContain(
            "On-hit Rider"
        );
        expect(listCombatReminders(character, "en")).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: "On-hit Rider" }),
            ])
        );
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

    it("maps catalog casting time when display meta has no actionCost", () => {
        const withFeatherFall: StoredCharacter = {
            ...stored,
            grants: [
                ...(stored.grants ?? []),
                {
                    id: "class-wizard-spell-feather-fall",
                    kind: "spell",
                    ref: "feather-fall",
                    name: "Feather Fall",
                    source: { type: "class", id: "wizard" },
                },
            ],
        };

        const groups = groupDisplayActions(
            buildDisplayActions(withFeatherFall, resolved, "en", () => "Main hand")
        );

        expect(
            groups.find((group) => group.cost === "reaction")?.actions
        ).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    title: "Feather Fall",
                    sourceType: "spell",
                }),
            ])
        );
        const actionTitles =
            groups
                .find((group) => group.cost === "action")
                ?.actions.map((action) => action.title) ?? [];
        expect(actionTitles).not.toContain("Feather Fall");
    });

    it("maps bonus-action and reaction spells into those cost groups, not Action", () => {
        const withCastingTimes: StoredCharacter = {
            ...stored,
            grants: [
                ...(stored.grants ?? []),
                {
                    id: "class-wizard-spell-misty-step",
                    kind: "spell",
                    ref: "misty-step",
                    name: "Misty Step",
                    source: { type: "class", id: "wizard" },
                },
                {
                    id: "class-wizard-spell-shield",
                    kind: "spell",
                    ref: "shield",
                    name: "Shield",
                    source: { type: "class", id: "wizard" },
                },
            ],
        };

        const groups = groupDisplayActions(
            buildDisplayActions(withCastingTimes, resolved, "en", () => "Main hand")
        );

        expect(
            groups.find((group) => group.cost === "bonus")?.actions
        ).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    title: "Misty Step",
                    sourceType: "spell",
                }),
            ])
        );
        expect(
            groups.find((group) => group.cost === "reaction")?.actions
        ).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    title: "Shield",
                    sourceType: "spell",
                }),
            ])
        );
        const actionTitles =
            groups
                .find((group) => group.cost === "action")
                ?.actions.map((action) => action.title) ?? [];
        expect(actionTitles).not.toContain("Misty Step");
        expect(actionTitles).not.toContain("Shield");
    });

    it("puts unknown activation costs in the special group, not reminders", () => {
        const character: StoredCharacter = {
            ...stored,
            grants: [
                {
                    id: "class-example-ability-unknown-cost",
                    kind: "ability",
                    ref: "Unknown Cost Feature",
                    name: "Unknown Cost Feature",
                    source: { type: "class", id: "example" },
                    activation: { cost: "legendary" },
                },
            ],
        };

        const actions = buildDisplayActions(
            character,
            resolved,
            "en",
            () => "Main hand"
        );
        const groups = groupDisplayActions(actions);

        expect(
            groups.find((group) => group.cost === "special")?.actions
        ).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: "Unknown Cost Feature" }),
            ])
        );
        expect(actions.map((action) => action.title)).toContain(
            "Unknown Cost Feature"
        );
        expect(
            listCombatReminders(character, "en").map((action) => action.title)
        ).not.toContain("Unknown Cost Feature");
    });

    it("filters abilities to class and item activations, excluding weapons and spells", () => {
        const withItemFeature: StoredCharacter = {
            ...stored,
            grants: [
                ...(stored.grants ?? []),
                {
                    id: "item-cloak-ability-cinder-burst",
                    kind: "ability",
                    ref: "Cinder Burst",
                    name: "Cinder Burst",
                    source: { type: "item", id: "rpv_cloak-of-embers" },
                    activation: { cost: "action" },
                },
            ],
        };
        const actions = buildDisplayActions(
            withItemFeature,
            resolved,
            "en",
            () => "Main hand"
        );

        const abilityTitles = filterDisplayActions(actions, {
            weapons: false,
            spells: false,
            abilities: true,
        }).map((action) => action.title);
        expect(abilityTitles).toEqual(
            expect.arrayContaining(["Second Wind", "Cinder Burst"])
        );
        expect(abilityTitles).not.toContain("Longsword");
        expect(abilityTitles).not.toContain("Fire Bolt");
        expect(
            filterDisplayActions(actions, {
                weapons: false,
                spells: true,
                abilities: false,
            }).map((action) => action.title)
        ).toEqual(expect.arrayContaining(["Fire Bolt", "Burning Hands"]));
        expect(
            filterDisplayActions(actions, DEFAULT_ACTION_FILTER_STATE).map(
                (action) => action.title
            )
        ).toEqual(expect.arrayContaining(["Second Wind", "Longsword"]));
        expect(
            filterDisplayActions(actions, {
                weapons: true,
                spells: true,
                abilities: false,
            }).map((action) => action.title)
        ).toEqual(
            expect.arrayContaining(["Longsword", "Fire Bolt", "Burning Hands"])
        );
        expect(
            filterDisplayActions(actions, {
                weapons: true,
                spells: true,
                abilities: false,
            }).map((action) => action.title)
        ).not.toContain("Second Wind");
    });

    it("resets to show-all when the last category toggle is turned off", () => {
        const onlyWeapons = {
            weapons: true,
            spells: false,
            abilities: false,
        };
        expect(toggleActionFilterCategory(onlyWeapons, "weapons")).toEqual(
            DEFAULT_ACTION_FILTER_STATE
        );
    });
});
