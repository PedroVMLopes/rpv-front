import { resolveStats } from "@rpv/domain";
import {
    buildAcDerivationContextFromForm,
    deriveBaseAcFromForm,
    resolveAcFromForm,
} from "../lib/character/ac";
import {
    deriveDndBaseAc,
    formatDndAcBreakdown,
} from "../presets/dnd/ac";

describe("ac derivation helpers", () => {
    const baseAttributes = [
        { name: "strength", value: 10 },
        { name: "dexterity", value: 10 },
        { name: "constitution", value: 14 },
        { name: "intelligence", value: 10 },
        { name: "wisdom", value: 10 },
        { name: "charisma", value: 10 },
    ];

    it("derives D&D base AC from dexterity", () => {
        expect(deriveDndBaseAc({ dexterity: 10 })).toBe(10);
        expect(deriveDndBaseAc({ dexterity: 14 })).toBe(12);
        expect(deriveDndBaseAc({ dexterity: 8 })).toBe(9);
    });

    it("formats D&D AC breakdown", () => {
        expect(formatDndAcBreakdown({ dexterity: 14 })).toBe(
            "10 + DEX +2 = 12"
        );
        expect(formatDndAcBreakdown({ dexterity: 10 })).toBe(
            "10 + DEX +0 = 10"
        );
    });

    it("builds derivation context from form data", () => {
        expect(
            buildAcDerivationContextFromForm(
                {
                    attributes: baseAttributes,
                },
                "dnd",
                "en"
            )
        ).toEqual({
            dexterity: 10,
        });
    });

    it("includes race ASI in resolved dexterity for base AC", () => {
        expect(
            deriveBaseAcFromForm(
                {
                    race: "elf",
                    attributes: baseAttributes.map((attribute) =>
                        attribute.name === "dexterity"
                            ? { ...attribute, value: 10 }
                            : attribute
                    ),
                },
                "dnd",
                "en"
            )
        ).toBe(11);
    });

    it("resolves AC from base stats when no item bonuses apply", () => {
        expect(
            resolveAcFromForm(
                {
                    ac: 12,
                    attributes: baseAttributes.map((attribute) =>
                        attribute.name === "dexterity"
                            ? { ...attribute, value: 14 }
                            : attribute
                    ),
                },
                "dnd",
                "en"
            )
        ).toBe(12);
    });

    it("layers armorClass modifiers on top of base AC", () => {
        const baseStats = {
            strength: 10,
            dexterity: 14,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
            armorClass: 12,
            hitPoints: 0,
        };

        const resolved = resolveStats(baseStats, [
            {
                id: "item-ring-of-protection",
                stat: "armorClass",
                operation: "add",
                value: 2,
                source: { type: "item", id: "ring-of-protection" },
                duration: { type: "permanent" },
                stacking: "stack",
                priority: 0,
            },
        ]);

        expect(resolved.armorClass).toBe(14);
    });
});
