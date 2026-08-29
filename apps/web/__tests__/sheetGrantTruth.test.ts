import { emptyInventory, resolveStats } from "@rpv/domain";
import { buildNewStoredCharacter } from "../lib/character/buildCharacter";
import { listOverviewTraitGroups } from "../lib/character/overviewTraits";
import { listSpellActions } from "../lib/character/combatActions";

const fighterForm = {
    name: "Sheet Hero",
    ac: 12,
    attributes: [
        { name: "strength", value: 16 },
        { name: "dexterity", value: 14 },
        { name: "constitution", value: 14 },
        { name: "intelligence", value: 10 },
        { name: "wisdom", value: 10 },
        { name: "charisma", value: 10 },
    ],
    characterClass: "fighter",
    choices: {
        grantPicks: {
            "class:fighter:base:exclusive:starting-wealth": "equipment",
        },
    },
};

function abilityNames(stored: ReturnType<typeof buildNewStoredCharacter>): string[] {
    return (stored.grants ?? [])
        .filter((grant) => grant.kind === "ability")
        .map((grant) => grant.ref);
}

describe("sheet grant truth after rebuild", () => {
    it("does not list Action Surge on a fighter at level 1", () => {
        const stored = buildNewStoredCharacter(
            { ...fighterForm, level: 1 },
            "player",
            "dnd",
            "en"
        );
        const overview = listOverviewTraitGroups(stored, "en");
        const classTraits =
            overview.find((group) => group.sourceType === "class")?.traits ?? [];

        expect(abilityNames(stored)).not.toContain("Action Surge");
        expect(classTraits.map((trait) => trait.name)).not.toContain(
            "Action Surge"
        );
    });

    it("lists Action Surge on a fighter at level 2", () => {
        const stored = buildNewStoredCharacter(
            { ...fighterForm, level: 2 },
            "player",
            "dnd",
            "en"
        );
        const overview = listOverviewTraitGroups(stored, "en");
        const classTraits =
            overview.find((group) => group.sourceType === "class")?.traits ?? [];

        expect(abilityNames(stored)).toContain("Action Surge");
        expect(classTraits.map((trait) => trait.name)).toContain("Action Surge");
    });

    it("omits subclass features below the unlock level", () => {
        const stored = buildNewStoredCharacter(
            {
                ...fighterForm,
                level: 2,
                subclass: "fighter-champion",
            },
            "player",
            "dnd",
            "en"
        );

        expect(abilityNames(stored)).not.toContain("Improved Critical");
        expect(
            listOverviewTraitGroups(stored, "en").some((group) =>
                group.traits.some((trait) => trait.name === "Improved Critical")
            )
        ).toBe(false);
    });

    it("lists subclass features once the subclass is unlocked", () => {
        const stored = buildNewStoredCharacter(
            {
                ...fighterForm,
                level: 3,
                subclass: "fighter-champion",
            },
            "player",
            "dnd",
            "en"
        );

        expect(abilityNames(stored)).toContain("Improved Critical");
        expect(
            listOverviewTraitGroups(stored, "en").some((group) =>
                group.traits.some((trait) => trait.name === "Improved Critical")
            )
        ).toBe(true);
    });

    it("does not grant bag item spells or HP; equipped items do", () => {
        const bagOnly = buildNewStoredCharacter(
            {
                ...fighterForm,
                level: 1,
                inventory: {
                    ...emptyInventory(),
                    bag: [
                        { slug: "rpv_scroll-of-fire-bolt", quantity: 1 },
                        { slug: "rpv_amulet-of-vitality", quantity: 1 },
                    ],
                },
            },
            "player",
            "dnd",
            "en"
        );

        expect(
            bagOnly.grants.some(
                (grant) =>
                    grant.source.type === "item" &&
                    grant.source.id === "rpv_scroll-of-fire-bolt"
            )
        ).toBe(false);
        expect(
            bagOnly.modifiers.some(
                (modifier) => modifier.source.id === "rpv_amulet-of-vitality"
            )
        ).toBe(false);

        const equipped = buildNewStoredCharacter(
            {
                ...fighterForm,
                level: 1,
                inventory: {
                    bag: [],
                    equipped: {
                        "melee-main": "rpv_scroll-of-fire-bolt",
                        amulet: "rpv_amulet-of-vitality",
                    },
                    equippedMulti: {},
                },
            },
            "player",
            "dnd",
            "en"
        );

        expect(equipped.grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "spell",
                    ref: "fire-bolt",
                    source: { type: "item", id: "rpv_scroll-of-fire-bolt" },
                }),
            ])
        );
        expect(equipped.modifiers).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    stat: "hitPoints",
                    source: { type: "item", id: "rpv_amulet-of-vitality" },
                }),
            ])
        );

        const resolved = resolveStats(equipped.baseStats, equipped.modifiers);
        const { cantrips } = listSpellActions(equipped, resolved, "en");
        expect(cantrips.some((action) => action.slug === "fire-bolt")).toBe(
            true
        );
    });
});
