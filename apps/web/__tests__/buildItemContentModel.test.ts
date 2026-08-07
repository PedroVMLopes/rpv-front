import { getItem } from "@rpv/content";
import {
    buildItemContentModel,
    type ItemContentFormatters,
} from "@/lib/content/buildItemContentModel";

const formatters: ItemContentFormatters = {
    missingValue: "—",
};

describe("buildItemContentModel", () => {
    it("builds summary and detail from catalog item", () => {
        const itemEntry = getItem("srd_leather-armor", "dnd");
        const { summary, detail } = buildItemContentModel(
            {
                id: "bag:srd_leather-armor",
                itemEntry,
                fallbackTitle: "srd_leather-armor",
                badges: [{ label: "Armor", variant: "muted" }],
            },
            formatters
        );

        expect(summary.kind).toBe("item");
        expect(summary.title).toBe("Leather Armor");
        expect(summary.badges.map((badge) => badge.label)).toEqual(["Armor"]);
        expect(summary.useAction).toBeUndefined();
        expect(detail.description).toBeTruthy();
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "category")
                ?.value
        ).toBe(itemEntry?.category.name);
    });

    it("falls back when item is missing", () => {
        const { summary, detail } = buildItemContentModel(
            {
                id: "missing",
                itemEntry: null,
                fallbackTitle: "unknown-slug",
                quantity: 3,
            },
            formatters
        );

        expect(summary.title).toBe("unknown-slug");
        expect(summary.badges).toEqual([]);
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "quantity")
                ?.value
        ).toBe("3");
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "quantity")
                ?.quantityControls
        ).toBe(true);
        expect(
            detail.sections[0]?.rows.find((row) => row.labelKey === "category")
                ?.value
        ).toBe("—");
    });

    it("defaults badge to category name when badges omitted", () => {
        const itemEntry = getItem("srd_arrow-bow", "dnd");
        const { summary } = buildItemContentModel(
            {
                id: "arrows",
                itemEntry,
                fallbackTitle: "Arrow",
            },
            formatters
        );

        expect(summary.badges[0]?.label).toBe(itemEntry?.category.name);
    });
});
