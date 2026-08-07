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
        slotId: "melee-main",
        attackModifier: null,
        ...overrides,
    };
}

describe("buildWeaponContentModel", () => {
    it("builds split attack/damage useActions without damage badge", () => {
        const itemEntry = getItem("srd_longsword", "dnd");
        const weapon = makeWeapon({
            slug: "srd_longsword",
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
        ]);
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
                label: "1d8 +3",
            },
        ]);
        expect(summary.useAction).toEqual(summary.useActions?.[0]);
        expect(detail.useActions).toEqual(summary.useActions);
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

    it("builds attack-only useActions when damage dice are missing", () => {
        const weapon = makeWeapon({
            slug: "srd_longsword",
            name: "Longsword",
            attackModifier: 4,
        });

        const { summary } = buildWeaponContentModel(
            {
                weapon,
                itemEntry: getItem("srd_longsword", "dnd"),
                slotLabel: "Main hand",
            },
            formatters
        );

        expect(summary.useActions).toEqual([
            {
                kind: "roll",
                role: "attack",
                captionKey: "toHitCaption",
                label: "d20 +4",
            },
        ]);
    });

    it("builds damage-only useActions when attack modifier is missing", () => {
        const weapon = makeWeapon({
            slug: "srd_longsword",
            name: "Longsword",
            damageDice: "1d8",
            damageFlat: 2,
        });

        const { summary } = buildWeaponContentModel(
            {
                weapon,
                itemEntry: getItem("srd_longsword", "dnd"),
                slotLabel: "Main hand",
            },
            formatters
        );

        expect(summary.useActions).toEqual([
            {
                kind: "roll",
                role: "damage",
                captionKey: "damageCaption",
                label: "1d8 +2",
            },
        ]);
    });

    it("omits use actions when weapon has no combat profile", () => {
        const weapon = makeWeapon({
            slug: "srd_longbow",
            name: "Longbow",
            slotId: "melee-main",
        });

        const { summary, detail } = buildWeaponContentModel(
            {
                weapon,
                itemEntry: getItem("srd_longbow", "dnd"),
                slotLabel: "Main hand",
            },
            formatters
        );

        expect(summary.useAction).toBeUndefined();
        expect(summary.useActions).toBeUndefined();
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
