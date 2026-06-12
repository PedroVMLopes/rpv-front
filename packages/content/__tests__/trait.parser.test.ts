import { readFileSync } from "fs";
import { join } from "path";
import { kebabCase, parseTraitBlocks } from "../src/race/trait.parser";
import type { Open5eRace } from "../src/open5e/open5e.types";

function loadRace(slug: string): Open5eRace {
    return JSON.parse(
        readFileSync(join(__dirname, "fixtures", "races", `${slug}.json`), "utf-8")
    ) as Open5eRace;
}

describe("kebabCase", () => {
    it("normalizes trait names to slugs", () => {
        expect(kebabCase("Keen Senses")).toBe("keen-senses");
        expect(kebabCase("Elf Weapon Training")).toBe("elf-weapon-training");
        expect(kebabCase("Cantrip")).toBe("cantrip");
    });
});

describe("parseTraitBlocks", () => {
    it("splits the elf trait markdown into named blocks", () => {
        const elf = loadRace("elf");
        const traits = parseTraitBlocks(elf.traits);

        expect(traits.map((t) => t.slug)).toEqual([
            "keen-senses",
            "fey-ancestry",
            "trance",
        ]);
        expect(traits[0].name).toBe("Keen Senses");
        expect(traits[0].description).toContain("proficiency in the Perception");
    });

    it("splits the high-elf subrace trait markdown", () => {
        const elf = loadRace("elf");
        const highElf = elf.subraces[0];
        const traits = parseTraitBlocks(highElf.traits);

        expect(traits.map((t) => t.slug)).toEqual([
            "elf-weapon-training",
            "cantrip",
            "extra-language",
        ]);
        expect(traits[1].description).toContain("wizard spell list");
    });

    it("returns an empty array for empty input", () => {
        expect(parseTraitBlocks("")).toEqual([]);
    });
});
