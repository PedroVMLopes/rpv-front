import { getSpell } from "@rpv/content";
import type { SpellAction } from "@/lib/character/combatActions";
import {
    buildSpellContentModel,
    type SpellContentFormatters,
} from "@/lib/content/buildSpellContentModel";

const formatters: SpellContentFormatters = {
    tSpells: (key, values) => {
        const table: Record<string, string> = {
            "target.single": "Single target",
            "target.area": "Area",
            "target.self": "Self",
            "target.touch": "Touch",
            "target.multiple": "Multiple targets",
            "school.evocation": "Evocation",
            "school.conjuration": "Conjuration",
            "school.divination": "Divination",
            "usage.atWill": "At will",
            "usage.spellSlot": `Uses a level ${values?.level} spell slot`,
            "actionCost.action": "Action",
            "actionCost.minute": "1 minute",
        };

        return table[key] ?? key;
    },
    tAbilities: (key) => key.toUpperCase(),
    tContentDetail: (key) => {
        const table: Record<string, string> = {
            yes: "Yes",
            no: "No",
        };
        return table[key] ?? key;
    },
    tUse: () => "Use",
    missingValue: "—",
};

function makeSpell(overrides: Partial<SpellAction> & Pick<SpellAction, "slug">): SpellAction {
    return {
        id: `spell-${overrides.slug}`,
        name: overrides.slug,
        levelInt: overrides.levelInt ?? 0,
        attackModifier: null,
        saveDcValue: null,
        ...overrides,
    };
}

describe("buildSpellContentModel", () => {
    it("builds split attack/damage useActions for fire-bolt", () => {
        const catalogEntry = getSpell("fire-bolt");
        const spell = makeSpell({
            slug: "fire-bolt",
            name: "Fire Bolt",
            levelInt: 0,
            rollProfile: {
                mode: "attack",
                damageDice: "1d10",
                damageType: "fire",
            },
            attackModifier: 5,
        });

        const { summary, detail } = buildSpellContentModel(
            {
                spell,
                catalogEntry,
                spellcastingAbility: "intelligence",
            },
            formatters
        );

        expect(summary.badges[0]?.label).toBe("Single target");
        expect(summary.useActions).toEqual([
            {
                kind: "roll",
                role: "attack",
                captionKey: "toHitCaption",
                label: "d20 +5",
            },
            {
                kind: "roll",
                role: "damage",
                captionKey: "damageCaption",
                label: "1d10",
            },
        ]);
        expect(summary.useAction).toEqual(summary.useActions?.[0]);
        expect(detail.useActions).toEqual(summary.useActions);
        expect(summary.shortDescription).toContain("ranged spell attack");
        expect(detail.sections[0]?.rows.find((row) => row.labelKey === "usage")?.value).toBe(
            "At will"
        );
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "range")?.value
        ).toBe("120 feet");
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "castingTime")
                ?.value
        ).toBe("1 action");
        expect(detail.source).toBe("5e Core Rules · phb 242");
    });

    it("builds a single damage useAction in useActions for burning-hands", () => {
        const catalogEntry = getSpell("burning-hands");
        const spell = makeSpell({
            slug: "burning-hands",
            name: "Burning Hands",
            levelInt: 1,
            rollProfile: {
                mode: "save",
                saveAbility: "dexterity",
                damageDice: "3d6",
                damageType: "fire",
            },
            saveDcValue: 13,
        });

        const { summary } = buildSpellContentModel(
            {
                spell,
                catalogEntry,
                spellcastingAbility: "intelligence",
            },
            formatters
        );

        expect(summary.useActions).toEqual([
            {
                kind: "roll",
                captionKey: "damageCaption",
                label: "3d6",
            },
        ]);
        expect(summary.useAction).toEqual(summary.useActions?.[0]);
    });

    it("builds a single damage useActions entry for magic-missile", () => {
        const catalogEntry = getSpell("magic-missile");
        const spell = makeSpell({
            slug: "magic-missile",
            name: "Magic Missile",
            levelInt: 1,
            rollProfile: {
                mode: "damage_only",
                damageDice: "3d4",
                damageType: "force",
                flatPerDie: 1,
            },
        });

        const { summary } = buildSpellContentModel(
            {
                spell,
                catalogEntry,
                spellcastingAbility: "intelligence",
            },
            formatters
        );

        expect(summary.useActions).toEqual([
            {
                kind: "roll",
                captionKey: "damageCaption",
                label: "3d4+1",
            },
        ]);
    });

    it("builds a cast use action for detect-magic without roll profile", () => {
        const catalogEntry = getSpell("detect-magic");
        const spell = makeSpell({
            slug: "detect-magic",
            name: "Detect Magic",
            levelInt: 1,
        });

        const { summary } = buildSpellContentModel(
            {
                spell,
                catalogEntry,
                spellcastingAbility: "intelligence",
            },
            formatters
        );

        expect(summary.useAction).toEqual({ kind: "cast", label: "Use" });
        expect(summary.useActions).toBeUndefined();
    });

    it("omits use action for mage-hand cantrip without roll or slot consumption", () => {
        const catalogEntry = getSpell("mage-hand");
        const spell = makeSpell({
            slug: "mage-hand",
            name: "Mage Hand",
            levelInt: 0,
        });

        const { summary } = buildSpellContentModel(
            {
                spell,
                catalogEntry,
                spellcastingAbility: "intelligence",
            },
            formatters
        );

        expect(summary.useAction).toBeUndefined();
        expect(summary.useActions).toBeUndefined();
    });

    it("includes enriched detail rows and short description for burning-hands", () => {
        const catalogEntry = getSpell("burning-hands");
        const spell = makeSpell({
            slug: "burning-hands",
            name: "Burning Hands",
            levelInt: 1,
            rollProfile: {
                mode: "save",
                saveAbility: "dexterity",
                damageDice: "3d6",
                damageType: "fire",
            },
        });

        const { summary, detail } = buildSpellContentModel(
            {
                spell,
                catalogEntry,
                spellcastingAbility: "intelligence",
            },
            formatters
        );

        const rows = detail.sections[0]?.rows ?? [];
        const byKey = Object.fromEntries(
            rows.map((row) => [row.labelKey, row.value])
        );

        expect(summary.shortDescription).toBe(
            "15-foot cone; Dexterity save; 3d6 fire damage, half on success; ignites flammable objects"
        );
        expect(byKey.range).toBe("Self (15-foot cone)");
        expect(byKey.components).toBe("V, S");
        expect(byKey.concentration).toBe("No");
        expect(byKey.ritual).toBe("No");
        expect(byKey.castingTime).toBe("1 action");
        expect(byKey.spellLists).toBe("Sorcerer, Wizard");
        expect(byKey.archetype).toBe("Cleric: Light, Warlock: Fiend");
        expect(byKey.source).toBeUndefined();
        expect(detail.shortDescription).toBe(
            "15-foot cone; Dexterity save; 3d6 fire damage, half on success; ignites flammable objects"
        );
        expect(detail.source).toBe("5e Core Rules · phb 220");
    });
});
