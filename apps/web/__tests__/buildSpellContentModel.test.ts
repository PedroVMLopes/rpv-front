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
    tContentDetail: (key) => key,
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
    it("builds a roll use action for fire-bolt with single target badge", () => {
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
        expect(summary.useAction).toEqual({ kind: "roll", label: "1d10" });
        expect(detail.sections[0]?.rows.find((row) => row.labelKey === "usage")?.value).toBe(
            "At will"
        );
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
    });
});
