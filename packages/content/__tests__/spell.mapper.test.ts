import { readFileSync } from "fs";
import { join } from "path";
import { mapOpen5eSpell } from "../src/spell/spell.mapper";
import type { Open5eSpell } from "../src/open5e/open5e.types";
import { getSpellShortDescription } from "../src/curation/spellShortDescriptions.dnd";

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
            sourceDocumentTitle: "5e Core Rules",
            page: "phb 211",
            material: "",
            archetype: "",
            shortDescription: "",
            language: "en",
        });
    });

    it("maps material, page, and archetype from fireball", () => {
        const spell = mapOpen5eSpell(loadSpell("fireball"));

        expect(spell).toMatchObject({
            slug: "fireball",
            material: "A tiny ball of bat guano and sulfur.",
            page: "phb 241",
            archetype: "Cleric: Light, Warlock: Fiend",
            sourceDocumentTitle: "5e Core Rules",
        });
    });
});

describe("spell short descriptions", () => {
    it("provides a curated short description for burning-hands", () => {
        expect(getSpellShortDescription("burning-hands")).toBe(
            "15-foot cone; Dexterity save; 3d6 fire damage, half on success; ignites flammable objects"
        );
    });
});
