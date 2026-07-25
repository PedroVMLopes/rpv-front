import {
    formatSpellSlotResourceLabel,
    listSpellSlotResources,
    parseSpellSlotLevel,
} from "../lib/character/spellSlotResources";

describe("listSpellSlotResources", () => {
    it("returns spell slot resources sorted by level", () => {
        expect(
            listSpellSlotResources({
                hp: 14,
                "spell-slots-3": 1,
                "spell-slots-1": 4,
                "spell-slots-2": 2,
            })
        ).toEqual([
            { ref: "spell-slots-1", level: 1, count: 4 },
            { ref: "spell-slots-2", level: 2, count: 2 },
            { ref: "spell-slots-3", level: 3, count: 1 },
        ]);
    });

    it("omits zero or missing spell slot counts", () => {
        expect(
            listSpellSlotResources({
                "spell-slots-1": 2,
                "spell-slots-2": 0,
            })
        ).toEqual([{ ref: "spell-slots-1", level: 1, count: 2 }]);
    });

    it("ignores non spell slot resource keys", () => {
        expect(listSpellSlotResources({ hp: 8 })).toEqual([]);
    });
});

describe("parseSpellSlotLevel", () => {
    it("parses numeric spell slot levels", () => {
        expect(parseSpellSlotLevel("spell-slots-3")).toBe(3);
        expect(parseSpellSlotLevel("rage-uses")).toBeUndefined();
    });
});

describe("formatSpellSlotResourceLabel", () => {
    const translate = (
        key: "spellSlotsGrouped" | "spellSlotsGroupedDelta",
        values: { level: number; count: number }
    ) =>
        key === "spellSlotsGroupedDelta"
            ? `Spell Slots Level ${values.level}: +${values.count}`
            : `Spell Slots Level ${values.level}: ${values.count}`;

    it("formats totals and signed deltas", () => {
        expect(formatSpellSlotResourceLabel(1, 4, translate)).toBe(
            "Spell Slots Level 1: 4"
        );
        expect(
            formatSpellSlotResourceLabel(2, 1, translate, { signed: true })
        ).toBe("Spell Slots Level 2: +1");
    });
});
