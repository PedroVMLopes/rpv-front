import { getItem } from "@rpv/content";
import type { WeaponAction } from "@/lib/character/combatActions";
import {
    buildWeaponContentModel,
    type WeaponContentFormatters,
} from "@/lib/content/buildWeaponContentModel";

const formatters: WeaponContentFormatters = {
    tItems: (key) => {
        const table: Record<string, string> = {
            "properties.versatile": "Versatile",
            "damageType.slashing": "Slashing",
        };

        return table[key] ?? key;
    },
    missingValue: "—",
};

function makeWeapon(
    overrides: Partial<WeaponAction> & Pick<WeaponAction, "slug">
): WeaponAction {
    return {
        id: `weapon-${overrides.slug}`,
        name: overrides.slug,
        slotId: "main-hand",
        attackModifier: null,
        ...overrides,
    };
}

describe("buildWeaponContentModel", () => {
    it("builds roll use action and combat badges for longsword", () => {
        const itemEntry = getItem("longsword", "dnd");
        const weapon = makeWeapon({
            slug: "longsword",
            name: "Longsword",
            toHit: "+5",
            damage: "1d8+3 slashing",
            attackModifier: 5,
            damageDice: "1d8",
            damageFlat: 3,
            damageType: "slashing",
        });

        const { summary, detail } = buildWeaponContentModel(
            {
                weapon,
                itemEntry,
                slotLabel: "Main hand",
            },
            formatters
        );

        expect(summary.kind).toBe("item");
        expect(summary.badges.map((badge) => badge.label)).toEqual([
            "Main hand",
            "+5",
            "1d8+3 slashing",
        ]);
        expect(summary.useAction).toEqual({ kind: "roll", label: "d20 +5" });
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "properties")
                ?.value
        ).toBe("Versatile");
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "damageType")
                ?.value
        ).toBe("Slashing");
        expect(
            detail.sections[0]?.rows.find(
                (row) => row.labelKey === "versatileDamage"
            )?.value
        ).toBe("1d10");
    });

    it("omits use action when weapon has no combat profile", () => {
        const weapon = makeWeapon({
            slug: "longbow",
            name: "Longbow",
            slotId: "main-hand",
        });

        const { summary, detail } = buildWeaponContentModel(
            {
                weapon,
                itemEntry: getItem("longbow", "dnd"),
                slotLabel: "Main hand",
            },
            formatters
        );

        expect(summary.useAction).toBeUndefined();
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "attackBonus")
                ?.value
        ).toBe("—");
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "damage")
                ?.value
        ).toBe("—");
    });
});
