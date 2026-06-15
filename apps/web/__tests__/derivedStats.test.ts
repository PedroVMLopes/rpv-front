import type { Stats } from "@rpv/domain";
import {
    computeInitiative,
    computePassivePerception,
    getProficiencyBonus,
} from "../lib/character/derivedStats";

describe("getProficiencyBonus", () => {
    it("returns +2 at levels 1-4", () => {
        expect(getProficiencyBonus(1)).toBe(2);
        expect(getProficiencyBonus(4)).toBe(2);
    });

    it("returns +3 at levels 5-8", () => {
        expect(getProficiencyBonus(5)).toBe(3);
        expect(getProficiencyBonus(8)).toBe(3);
    });

    it("returns +4 at levels 9-12", () => {
        expect(getProficiencyBonus(9)).toBe(4);
    });

    it("returns +5 at levels 13-16", () => {
        expect(getProficiencyBonus(13)).toBe(5);
    });

    it("returns +6 at levels 17-20", () => {
        expect(getProficiencyBonus(17)).toBe(6);
    });
});

describe("computeInitiative", () => {
    it("returns DEX modifier from resolved stats", () => {
        const stats: Stats = {
            strength: 10,
            dexterity: 14,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
            armorClass: 10,
            hitPoints: 0,
        };

        expect(computeInitiative(stats)).toBe(2);
    });

    it("handles negative DEX modifiers", () => {
        const stats: Stats = {
            strength: 10,
            dexterity: 8,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
            armorClass: 10,
            hitPoints: 0,
        };

        expect(computeInitiative(stats)).toBe(-1);
    });

    it("defaults missing dexterity to +0", () => {
        const stats = {
            strength: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
            armorClass: 10,
            hitPoints: 0,
        } as Stats;

        expect(computeInitiative(stats)).toBe(0);
    });
});

describe("computePassivePerception", () => {
    it("adds 10 to the Perception skill modifier", () => {
        expect(
            computePassivePerception([{ slug: "perception", modifier: 3 }])
        ).toBe(13);
    });

    it("returns 10 when Perception is not in the list", () => {
        expect(computePassivePerception([])).toBe(10);
    });

    it("returns 10 when Perception modifier is zero", () => {
        expect(
            computePassivePerception([{ slug: "perception", modifier: 0 }])
        ).toBe(10);
    });
});
