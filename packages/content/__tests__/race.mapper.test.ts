import { readFileSync } from "fs";
import { join } from "path";
import { mapOpen5eRace } from "../src/race/race.mapper";
import type { Open5eRace } from "../src/open5e/open5e.types";

function loadRace(slug: string): Open5eRace {
    return JSON.parse(
        readFileSync(join(__dirname, "fixtures", "races", `${slug}.json`), "utf-8")
    ) as Open5eRace;
}

describe("mapOpen5eRace", () => {
    it("maps structured fields and the ASI synthetic trait", () => {
        const elf = mapOpen5eRace(loadRace("elf"));

        expect(elf.slug).toBe("elf");
        expect(elf.size).toBe("Medium");
        expect(elf.speedWalk).toBe(30);
        expect(elf.sourceDocument).toBe("wotc-srd");

        const asiTrait = elf.traits.find(
            (t) => t.slug === "ability-score-increase"
        );
        expect(asiTrait?.grants).toEqual([
            {
                grantType: "ability_score",
                choose: 0,
                targetStat: "dexterity",
                amount: 2,
            },
        ]);
    });

    it("applies curation overrides to parsed traits", () => {
        const elf = mapOpen5eRace(loadRace("elf"));
        const keenSenses = elf.traits.find((t) => t.slug === "keen-senses");

        expect(keenSenses?.category).toBe("proficiency");
        expect(keenSenses?.grants).toEqual([
            {
                grantType: "skill_proficiency",
                choose: 0,
                options: [{ optionType: "skill", ref: "perception" }],
            },
        ]);
    });

    it("maps subraces with their own ASI and trait grants", () => {
        const elf = mapOpen5eRace(loadRace("elf"));
        const highElf = elf.subraces.find((s) => s.slug === "high-elf");

        expect(highElf?.raceSlug).toBe("elf");

        const asiTrait = highElf?.traits.find(
            (t) => t.slug === "ability-score-increase"
        );
        expect(asiTrait?.grants[0]).toMatchObject({
            targetStat: "intelligence",
            amount: 1,
        });

        const cantrip = highElf?.traits.find((t) => t.slug === "cantrip");
        expect(cantrip?.category).toBe("spellcasting");
        expect(cantrip?.grants[0]).toMatchObject({
            grantType: "spell",
            choose: 1,
            selectionFilter: { spellLists: ["wizard"], levelInt: 0 },
        });
    });

    it("keeps non-mechanical subrace traits as features (no grants)", () => {
        const dwarf = mapOpen5eRace(loadRace("dwarf"));
        const hillDwarf = dwarf.subraces.find((s) => s.slug === "hill-dwarf");
        const toughness = hillDwarf?.traits.find(
            (t) => t.slug === "dwarven-toughness"
        );

        expect(toughness).toBeDefined();
        expect(toughness?.grants).toEqual([]);
    });

    it("applies dndRaceAsiOverrides for distributable racial ASI", () => {
        const halfElf = mapOpen5eRace(loadRace("half-elf"));
        const asiTrait = halfElf.traits.find(
            (t) => t.slug === "ability-score-increase"
        );

        expect(asiTrait?.grants).toEqual([
            {
                grantType: "ability_score",
                choose: 0,
                targetStat: "charisma",
                amount: 2,
            },
            {
                grantType: "ability_score",
                choose: 2,
                amount: 1,
                description: "Two other ability scores of your choice",
                options: [
                    { optionType: "stat", ref: "strength" },
                    { optionType: "stat", ref: "dexterity" },
                    { optionType: "stat", ref: "constitution" },
                    { optionType: "stat", ref: "intelligence" },
                    { optionType: "stat", ref: "wisdom" },
                ],
            },
        ]);
    });
});
