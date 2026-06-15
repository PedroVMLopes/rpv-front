import type { Stats } from "@rpv/domain";
import { dndSavingThrows } from "@rpv/content";
import {
    computeSavingThrowModifiers,
    getProficientSaveStats,
} from "../lib/character/savingThrowModifiers";

const stats: Stats = {
    strength: 16,
    dexterity: 14,
    constitution: 12,
    intelligence: 10,
    wisdom: 10,
    charisma: 8,
    armorClass: 10,
    hitPoints: 0,
};

describe("getProficientSaveStats", () => {
    it("returns only saving_throw grant refs", () => {
        expect(
            getProficientSaveStats([
                {
                    id: "class-str",
                    kind: "saving_throw",
                    ref: "strength",
                    source: { type: "class", id: "fighter" },
                },
                {
                    id: "class-light-armor",
                    kind: "proficiency",
                    ref: "light-armor",
                    source: { type: "class", id: "fighter" },
                },
            ])
        ).toEqual(new Set(["strength"]));
    });
});

describe("computeSavingThrowModifiers", () => {
    it("adds proficiency bonus to proficient saves", () => {
        const modifiers = computeSavingThrowModifiers(
            stats,
            [
                {
                    id: "class-str",
                    kind: "saving_throw",
                    ref: "strength",
                    source: { type: "class", id: "fighter" },
                },
                {
                    id: "class-con",
                    kind: "saving_throw",
                    ref: "constitution",
                    source: { type: "class", id: "fighter" },
                },
            ],
            1,
            dndSavingThrows
        );

        const strength = modifiers.find((entry) => entry.stat === "strength");
        const dexterity = modifiers.find((entry) => entry.stat === "dexterity");

        expect(strength).toEqual(
            expect.objectContaining({
                modifier: 5,
                proficient: true,
            })
        );
        expect(dexterity).toEqual(
            expect.objectContaining({
                modifier: 2,
                proficient: false,
            })
        );
    });

    it("uses higher proficiency bonus at higher level", () => {
        const modifiers = computeSavingThrowModifiers(
            stats,
            [
                {
                    id: "class-str",
                    kind: "saving_throw",
                    ref: "strength",
                    source: { type: "class", id: "fighter" },
                },
            ],
            5,
            dndSavingThrows
        );

        expect(
            modifiers.find((entry) => entry.stat === "strength")?.modifier
        ).toBe(6);
    });

    it("handles negative ability modifiers", () => {
        const modifiers = computeSavingThrowModifiers(
            stats,
            [
                {
                    id: "class-cha",
                    kind: "saving_throw",
                    ref: "charisma",
                    source: { type: "class", id: "cleric" },
                },
            ],
            1,
            dndSavingThrows
        );

        expect(
            modifiers.find((entry) => entry.stat === "charisma")?.modifier
        ).toBe(1);
    });
});
