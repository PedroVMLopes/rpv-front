import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import {
    abilityScoreGrantsToModifiers,
    fixedGrantsToCharacterGrants,
    countLanguageChoices,
    resolveLanguagePool,
    resolveGrantPool,
    resolveSpellPool,
    statModifierGrantsToModifiers,
} from "../src/grant/grants";
import type { Grant } from "../src/grant/grant.types";
import { dndLanguages } from "../src/catalog/languages.seed";
import { mapOpen5eRace } from "../src/race/race.mapper";
import { mapOpen5eSpell } from "../src/spell/spell.mapper";
import type { Open5eRace, Open5eSpell } from "../src/open5e/open5e.types";

const SPELLS_DIR = join(__dirname, "fixtures", "spells");

function loadRace(slug: string): Open5eRace {
    return JSON.parse(
        readFileSync(join(__dirname, "fixtures", "races", `${slug}.json`), "utf-8")
    ) as Open5eRace;
}

function loadAllSpells() {
    return readdirSync(SPELLS_DIR)
        .filter((file) => file.endsWith(".json"))
        .map(
            (file) =>
                JSON.parse(readFileSync(join(SPELLS_DIR, file), "utf-8")) as Open5eSpell
        )
        .map(mapOpen5eSpell);
}

describe("abilityScoreGrantsToModifiers", () => {
    it("converts fixed ability_score grants into domain modifiers", () => {
        const grants: Grant[] = [
            {
                grantType: "ability_score",
                choose: 0,
                targetStat: "dexterity",
                amount: 2,
            },
        ];

        expect(abilityScoreGrantsToModifiers(grants, "elf")).toEqual([
            {
                id: "race-elf-dexterity",
                stat: "dexterity",
                operation: "add",
                value: 2,
                source: { type: "race", id: "elf" },
                duration: { type: "permanent" },
                stacking: "stack",
                priority: 0,
            },
        ]);
    });

    it("ignores choice-based and non-ability grants", () => {
        const grants: Grant[] = [
            { grantType: "ability_score", choose: 1, amount: 1 },
            { grantType: "skill_proficiency", choose: 0 },
        ];

        expect(abilityScoreGrantsToModifiers(grants, "elf")).toEqual([]);
    });
});

describe("statModifierGrantsToModifiers", () => {
    it("converts fixed stat_modifier grants into domain modifiers", () => {
        const grants: Grant[] = [
            {
                grantType: "stat_modifier",
                choose: 0,
                targetStat: "hitPoints",
                amount: 5,
            },
        ];

        expect(
            statModifierGrantsToModifiers(grants, {
                type: "item",
                id: "amulet-of-vitality",
            })
        ).toEqual([
            {
                id: "item-amulet-of-vitality-stat-hitPoints",
                stat: "hitPoints",
                operation: "add",
                value: 5,
                source: { type: "item", id: "amulet-of-vitality" },
                duration: { type: "permanent" },
                stacking: "stack",
                priority: 0,
            },
        ]);
    });
});

describe("fixedGrantsToCharacterGrants", () => {
    it("converts fixed language options into character grants", () => {
        const grants: Grant[] = [
            {
                grantType: "language",
                choose: 0,
                options: [
                    { optionType: "language", ref: "common" },
                    { optionType: "language", ref: "elvish" },
                ],
            },
        ];

        const result = fixedGrantsToCharacterGrants(grants, {
            type: "race",
            id: "elf",
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
            kind: "language",
            ref: "common",
            source: { type: "race", id: "elf" },
        });
    });

    it("converts fixed ability grants", () => {
        const grants: Grant[] = [
            {
                grantType: "ability",
                choose: 0,
                description: "Fey Ancestry",
            },
        ];

        const result = fixedGrantsToCharacterGrants(grants, {
            type: "race",
            id: "elf",
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            kind: "ability",
            ref: "Fey Ancestry",
            name: "Fey Ancestry",
        });
    });

    it("converts fixed saving throw proficiencies into saving_throw grants", () => {
        const grants: Grant[] = [
            {
                grantType: "saving_throw_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "strength" },
                    { optionType: "proficiency", ref: "constitution" },
                ],
            },
        ];

        const result = fixedGrantsToCharacterGrants(grants, {
            type: "class",
            id: "fighter",
        });

        expect(result).toEqual([
            expect.objectContaining({
                kind: "saving_throw",
                ref: "strength",
                source: { type: "class", id: "fighter" },
            }),
            expect.objectContaining({
                kind: "saving_throw",
                ref: "constitution",
                source: { type: "class", id: "fighter" },
            }),
        ]);
    });

    it("skips choice-based grants", () => {
        const grants: Grant[] = [
            {
                grantType: "language",
                choose: 1,
                selectionFilter: { any: true },
            },
        ];

        expect(
            fixedGrantsToCharacterGrants(grants, { type: "race", id: "elf" })
        ).toEqual([]);
    });

    it("skips stat_modifier grants", () => {
        const grants: Grant[] = [
            {
                grantType: "stat_modifier",
                choose: 0,
                targetStat: "hitPoints",
                amount: 5,
            },
        ];

        expect(
            fixedGrantsToCharacterGrants(grants, {
                type: "item",
                id: "amulet-of-vitality",
            })
        ).toEqual([]);
    });

    it("converts fixed resource grants", () => {
        const grants: Grant[] = [
            {
                grantType: "resource",
                choose: 0,
                ref: "spell-slots-1",
                amount: 2,
            },
        ];

        const result = fixedGrantsToCharacterGrants(
            grants,
            { type: "class", id: "wizard" },
            { featureLevel: 1 }
        );

        expect(result).toEqual([
            {
                id: "class-wizard-1-resource-spell-slots-1",
                kind: "resource",
                ref: "spell-slots-1",
                amount: 2,
                source: { type: "class", id: "wizard" },
                name: undefined,
            },
        ]);
    });

    it("uses distinct ids for resource grants at different feature levels", () => {
        const grant: Grant = {
            grantType: "resource",
            choose: 0,
            ref: "spell-slots-1",
            amount: 1,
        };
        const source = { type: "class" as const, id: "wizard" };

        const level1 = fixedGrantsToCharacterGrants([grant], source, {
            featureLevel: 1,
        });
        const level2 = fixedGrantsToCharacterGrants([grant], source, {
            featureLevel: 2,
        });

        expect(level1[0].id).toBe("class-wizard-1-resource-spell-slots-1");
        expect(level2[0].id).toBe("class-wizard-2-resource-spell-slots-1");
        expect(level1[0].id).not.toBe(level2[0].id);
    });

    it("uses distinct ids for ability grants at different feature levels", () => {
        const source = { type: "class" as const, id: "monk" };
        const level1 = fixedGrantsToCharacterGrants(
            [
                {
                    grantType: "ability",
                    choose: 0,
                    description: "Unarmored Defense",
                },
                {
                    grantType: "ability",
                    choose: 0,
                    description: "Martial Arts",
                },
            ],
            source,
            { featureLevel: 1 }
        );
        const level2 = fixedGrantsToCharacterGrants(
            [
                {
                    grantType: "resource",
                    choose: 0,
                    ref: "ki-points",
                    amount: 2,
                },
                {
                    grantType: "ability",
                    choose: 0,
                    description: "Ki",
                },
                {
                    grantType: "ability",
                    choose: 0,
                    description: "Unarmored Movement",
                },
            ],
            source,
            { featureLevel: 2 }
        );

        const ids = [...level1, ...level2].map((grant) => grant.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(level2.find((grant) => grant.ref === "Ki")?.id).toBe(
            "class-monk-2-ability-Ki"
        );
    });

    it("skips incomplete resource grants", () => {
        const grants: Grant[] = [
            { grantType: "resource", choose: 0, ref: "spell-slots-1" },
            { grantType: "resource", choose: 0, amount: 2 },
        ];

        expect(
            fixedGrantsToCharacterGrants(grants, { type: "class", id: "wizard" })
        ).toEqual([]);
    });
});

describe("countLanguageChoices", () => {
    it("sums choose counts for language grants", () => {
        const grants: Grant[] = [
            { grantType: "language", choose: 1, selectionFilter: { any: true } },
            { grantType: "language", choose: 2, selectionFilter: { any: true } },
            { grantType: "language", choose: 0, options: [{ optionType: "language", ref: "common" }] },
        ];

        expect(countLanguageChoices(grants)).toBe(3);
    });
});

describe("resolveLanguagePool", () => {
    it("returns all languages when filter is any", () => {
        const grant: Grant = {
            grantType: "language",
            choose: 1,
            selectionFilter: { any: true },
        };

        expect(resolveLanguagePool(grant, dndLanguages)).toHaveLength(
            dndLanguages.length
        );
    });

    it("returns enumerated language options", () => {
        const grant: Grant = {
            grantType: "language",
            choose: 0,
            options: [{ optionType: "language", ref: "common" }],
        };

        expect(resolveLanguagePool(grant, dndLanguages)).toEqual([
            dndLanguages[0],
        ]);
    });
});

describe("resolveSpellPool", () => {
    it("filters spells by list and level", () => {
        const spells = loadAllSpells();
        const wizardCantrips = resolveSpellPool(
            { spellLists: ["wizard"], levelInt: 0 },
            spells
        );

        expect(wizardCantrips.length).toBeGreaterThan(1);
        expect(wizardCantrips.every((s) => s.spellLists.includes("wizard"))).toBe(
            true
        );
        expect(wizardCantrips.every((s) => s.levelInt === 0)).toBe(true);
    });
});

describe("resolveGrantPool", () => {
    it("resolves the high-elf cantrip grant against the spell catalog", () => {
        const elf = mapOpen5eRace(loadRace("elf"));
        const highElf = elf.subraces.find((s) => s.slug === "high-elf")!;
        const cantripGrant = highElf.traits.find((t) => t.slug === "cantrip")!
            .grants[0];

        const pool = resolveGrantPool(cantripGrant, { spells: loadAllSpells() });

        expect(pool.spells).toBeDefined();
        expect(pool.spells!.map((s) => s.slug)).toContain("acid-splash");
        expect(pool.spells!.length).toBeGreaterThan(1);
    });

    it("returns enumerated options when present", () => {
        const grant: Grant = {
            grantType: "weapon_proficiency",
            choose: 0,
            options: [{ optionType: "proficiency", ref: "longsword" }],
        };

        const pool = resolveGrantPool(grant, { spells: [] });

        expect(pool.options).toEqual([
            { optionType: "proficiency", ref: "longsword" },
        ]);
    });

    it("returns inventoryOptions with index values and item labels", () => {
        const grant: Grant = {
            grantType: "inventory_item",
            choose: 1,
            options: [
                { optionType: "item", ref: "pilot-test-dagger" },
                {
                    optionType: "inventory_bundle",
                    label: "Starter kit",
                    items: [{ ref: "leather-armor" }],
                },
            ],
        };

        const pool = resolveGrantPool(grant, { spells: [] });

        expect(pool.inventoryOptions).toEqual([
            { value: "0", label: "Pilot Test Dagger" },
            { value: "1", label: "Starter kit" },
        ]);
    });

    it("returns empty pool for reserved item selection filters", () => {
        const grant: Grant = {
            grantType: "inventory_item",
            choose: 1,
            selectionFilter: { itemCategory: "weapon", itemTags: ["martial"] },
        };

        const pool = resolveGrantPool(grant, { spells: [] });

        expect(pool).toEqual({});
    });

    it("returns stat options for distributable ability_score grants", () => {
        const grant: Grant = {
            grantType: "ability_score",
            choose: 2,
            amount: 1,
            options: [
                { optionType: "stat", ref: "strength" },
                { optionType: "stat", ref: "dexterity" },
            ],
        };

        const pool = resolveGrantPool(grant, { spells: [] });

        expect(pool.options).toEqual([
            { optionType: "stat", ref: "strength" },
            { optionType: "stat", ref: "dexterity" },
        ]);
    });

    it("returns stat options from selectionFilter.stats", () => {
        const grant: Grant = {
            grantType: "ability_score",
            choose: 1,
            amount: 1,
            selectionFilter: { stats: ["intelligence", "wisdom"] },
        };

        const pool = resolveGrantPool(grant, { spells: [] });

        expect(pool.options).toEqual([
            { optionType: "stat", ref: "intelligence" },
            { optionType: "stat", ref: "wisdom" },
        ]);
    });
});
