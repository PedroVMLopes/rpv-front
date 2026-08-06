import { getItem } from "@rpv/content";
import {
    buildBundlePickContentModel,
    buildItemPickContentModel,
    type ItemPickContentFormatters,
} from "../lib/content/buildItemPickContentModel";

const formatters: ItemPickContentFormatters = {
    tItems: (key, values) => {
        const table: Record<string, string> = {
            "properties.versatile": "Versatile",
            "damageType.slashing": "Slashing",
            "pick.bundleBadge": "Bundle",
            "pick.bundleItemCount": `${values?.count ?? ""} items`,
            "pick.grantFallback": String(values?.type ?? key),
        };

        return table[key] ?? key;
    },
    tContentDetail: (key) => key,
    missingValue: "—",
    slotLabel: (slotId) => {
        if (slotId === "melee-main") {
            return "Main hand";
        }
        if (slotId === "armor") {
            return "Armor";
        }
        return slotId;
    },
};

describe("buildItemPickContentModel", () => {
    it("builds weapon badges and detail for longsword", () => {
        const item = getItem("srd_longsword", "dnd");
        expect(item).toBeDefined();

        const { summary, detail } = buildItemPickContentModel(item!, formatters);

        expect(summary.title).toBe("Longsword");
        expect(summary.useAction).toBeUndefined();
        expect(summary.badges.map((badge) => badge.label)).toEqual(
            expect.arrayContaining(["1d8 Slashing", "Versatile"])
        );
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "properties")
                ?.value
        ).toBe("Versatile");
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "damage")
                ?.value
        ).toBe("1d8");
        expect(
            detail.sections[0]?.rows.find(
                (row) => row.labelKey === "versatileDamage"
            )?.value
        ).toBe("1d10");
        expect(summary.badges.map((badge) => badge.label)).toEqual(
            expect.arrayContaining(["weapon"])
        );
    });

    it("builds non-weapon item with armor display and no weapon rows", () => {
        const item = getItem("srd_leather-armor", "dnd");
        expect(item).toBeDefined();

        const { summary, detail } = buildItemPickContentModel(item!, formatters);

        expect(summary.title).toBe("Leather Armor");
        expect(summary.badges.map((badge) => badge.label)).not.toEqual(
            expect.arrayContaining([expect.stringMatching(/1d/)])
        );
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "damage")
        ).toBeUndefined();
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "armorClass")
                ?.value
        ).toMatch(/11 \+ Dex/);
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "grants")
        ).toBeUndefined();
    });
});

describe("buildBundlePickContentModel", () => {
    it("lists component items for a labeled bundle", () => {
        const { summary, detail } = buildBundlePickContentModel(
            {
                option: {
                    optionType: "inventory_bundle",
                    label: "Leather armor, longbow, and 20 arrows",
                    items: [
                        { ref: "srd_leather-armor", amount: 1 },
                        { ref: "srd_longbow", amount: 1 },
                        { ref: "srd_arrow-bow", amount: 20 },
                    ],
                },
                optionIndex: 1,
                system: "dnd",
                locale: "en",
            },
            formatters
        );

        expect(summary.title).toBe("Leather armor, longbow, and 20 arrows");
        expect(summary.badges.map((badge) => badge.label)).toEqual(
            expect.arrayContaining(["Bundle", "3 items"])
        );
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "contents")
                ?.value
        ).toMatch(/Leather Armor/);
        expect(detail.description).toMatch(/Arrow \(bow\) ×20/);
    });
});
