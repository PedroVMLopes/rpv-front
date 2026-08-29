import { getSpell } from "../src/catalog/bundled";
import { getSpellDisplayMeta } from "../src/curation/spellDisplay.dnd";
import { getSpellRollProfile } from "../src/curation/spellCombat.dnd";
import { withSpellOverlays } from "../src/curation/spellOverlayMerge";
import type { SpellCatalogEntry } from "../src/spell/spell.types";

const baseEntry = (slug: string): SpellCatalogEntry => ({
    slug,
    language: "en",
    name: slug,
    levelInt: 0,
    level: "Cantrip",
    school: "Evocation",
    castingTime: "1 action",
    range: "120 feet",
    components: "V, S",
    material: "",
    duration: "Instantaneous",
    requiresConcentration: false,
    canBeCastAsRitual: false,
    description: "",
    shortDescription: "",
    higherLevel: "",
    spellLists: ["wizard"],
    archetype: "",
    page: "",
    sourceDocument: "srd",
    sourceDocumentTitle: "SRD",
});

describe("withSpellOverlays", () => {
    it("attaches combat and display overlays to a catalog entry", () => {
        const merged = withSpellOverlays(baseEntry("fire-bolt"));
        expect(merged.rollProfile).toEqual({
            mode: "attack",
            damageDice: "1d10",
            damageType: "fire",
        });
        expect(merged.displayMeta).toEqual({ targetKind: "single" });
    });

    it("keeps values already on the catalog entry", () => {
        const merged = withSpellOverlays({
            ...baseEntry("fire-bolt"),
            rollProfile: {
                mode: "save",
                saveAbility: "dexterity",
                damageDice: "1d6",
                damageType: "fire",
            },
            displayMeta: { targetKind: "area" },
        });
        expect(merged.rollProfile?.mode).toBe("save");
        expect(merged.displayMeta?.targetKind).toBe("area");
    });
});

describe("getSpell helpers prefer catalog entry", () => {
    it("reads rollProfile from getSpell", () => {
        const entry = getSpell("fire-bolt");
        expect(entry?.rollProfile).toEqual(getSpellRollProfile("fire-bolt"));
        expect(getSpellRollProfile("fire-bolt", entry)).toEqual(entry?.rollProfile);
    });

    it("reads displayMeta from getSpell", () => {
        const entry = getSpell("fire-bolt");
        expect(entry?.displayMeta).toEqual(getSpellDisplayMeta("fire-bolt"));
        expect(getSpellDisplayMeta("fire-bolt", entry)).toEqual(entry?.displayMeta);
    });
});
