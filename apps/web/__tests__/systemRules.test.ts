import { dndSavingThrows, dndSkills } from "@rpv/content";
import {
    formatMaxHpBreakdownFromForm,
} from "../lib/character/hp";
import { formatBaseAcBreakdownFromForm } from "../lib/character/ac";
import { getSystemRules } from "../lib/character/systemRules";

describe("getSystemRules", () => {
    it("exposes every contract member for dnd", () => {
        const rules = getSystemRules("dnd");

        expect(rules.abilityModifier(14)).toBe(2);
        expect(rules.proficiencyBonus(5)).toBe(3);
        expect(rules.skills).toEqual(dndSkills);
        expect(rules.savingThrows).toEqual(dndSavingThrows);
        expect(typeof rules.hp.deriveMaxHp).toBe("function");
        expect(typeof rules.hp.formatBreakdown).toBe("function");
        expect(typeof rules.ac.deriveBaseAc).toBe("function");
        expect(typeof rules.ac.formatBreakdown).toBe("function");
        expect(typeof rules.initiative).toBe("function");
        expect(typeof rules.passivePerception).toBe("function");
    });

    it("formats HP breakdown through the contract", () => {
        const breakdown = getSystemRules("dnd").hp.formatBreakdown({
            level: 3,
            constitution: 14,
            classSlug: "fighter",
            hitDie: 10,
        });

        expect(breakdown).toBe("d10 + CON +2 at L1, +8 x 2 = 28");
    });

    it("formats AC breakdown through the contract", () => {
        const breakdown = getSystemRules("dnd").ac.formatBreakdown({
            dexterity: 14,
        });

        expect(breakdown).toBe("10 + DEX +2 = 12");
    });
});

describe("breakdown from form helpers", () => {
    const baseAttributes = [
        { name: "strength", value: 10 },
        { name: "dexterity", value: 14 },
        { name: "constitution", value: 14 },
        { name: "intelligence", value: 10 },
        { name: "wisdom", value: 10 },
        { name: "charisma", value: 10 },
    ];

    it("formats max HP breakdown from form without system branching", () => {
        expect(
            formatMaxHpBreakdownFromForm(
                {
                    characterClass: "fighter",
                    level: 1,
                    attributes: baseAttributes,
                },
                "dnd",
                "en"
            )
        ).toBe("d10 + CON +2 at L1 = 12");
    });

    it("formats base AC breakdown from form without system branching", () => {
        expect(
            formatBaseAcBreakdownFromForm(
                {
                    attributes: baseAttributes,
                },
                "dnd",
                "en"
            )
        ).toBe("10 + DEX +2 = 12");
    });
});
