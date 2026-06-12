import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import {
    abilityScoreGrantsToModifiers,
    resolveGrantPool,
    resolveSpellPool,
} from "../src/grant/grants";
import type { Grant } from "../src/grant/grant.types";
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
});
