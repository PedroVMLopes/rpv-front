import { readFileSync } from "fs";
import { join } from "path";
import { mapOpen5eSpell } from "../src/spell/spell.mapper";
import type { Open5eSpell } from "../src/open5e/open5e.types";

function loadSpell(slug: string): Open5eSpell {
    return JSON.parse(
        readFileSync(join(__dirname, "fixtures", "spells", `${slug}.json`), "utf-8")
    ) as Open5eSpell;
}

describe("mapOpen5eSpell", () => {
    it("maps the raw spell into the catalog shape", () => {
        const spell = mapOpen5eSpell(loadSpell("acid-splash"));

        expect(spell).toMatchObject({
            slug: "acid-splash",
            name: "Acid Splash",
            levelInt: 0,
            school: "Conjuration",
            spellLists: ["sorcerer", "wizard"],
            requiresConcentration: false,
            canBeCastAsRitual: false,
            sourceDocument: "wotc-srd",
        });
    });
});
