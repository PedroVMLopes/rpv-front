import { getActiveRollSides } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";

const closed = {
    open: false,
    mode: "manual" as const,
    request: null,
    selectedDie: 20 as const,
    stepIndex: 0,
    attackRoll: null,
    damageRolls: [] as number[],
    d20RollMode: "normal" as const,
    d20Rolls: [] as number[],
    extraDice: [] as number[],
    extraDieRolls: [] as number[],
};

describe("getActiveRollSides", () => {
    it("returns null when closed or when a request is missing", () => {
        expect(getActiveRollSides(closed)).toBeNull();
        expect(
            getActiveRollSides({
                ...closed,
                open: true,
                mode: "request",
                request: null,
            })
        ).toBeNull();
    });

    it("returns the selected die in manual mode", () => {
        expect(
            getActiveRollSides({ ...closed, open: true, selectedDie: 8 })
        ).toBe(8);
        expect(
            getActiveRollSides({ ...closed, open: true, selectedDie: null })
        ).toBeNull();
    });

    it("uses d20 for tests and the attack step of attack_then_damage", () => {
        expect(
            getActiveRollSides({
                ...closed,
                open: true,
                mode: "request",
                request: {
                    kind: "d20_test",
                    id: "skill:athletics",
                    label: "Athletics",
                    die: 20,
                    modifier: 2,
                    appliesTo: "ability_check",
                },
            })
        ).toBe(20);

        expect(
            getActiveRollSides({
                ...closed,
                open: true,
                mode: "request",
                stepIndex: 0,
                request: {
                    kind: "attack_then_damage",
                    id: "weapon:longsword",
                    label: "Longsword",
                    attack: { die: 20, modifier: 5 },
                    damage: { sides: 8 },
                },
            })
        ).toBe(20);
    });

    it("uses damage sides on the second attack step and null when sides are missing", () => {
        const request = {
            kind: "attack_then_damage" as const,
            id: "weapon:longsword",
            label: "Longsword",
            attack: { die: 20 as const, modifier: 5 },
            damage: { sides: 8 as const },
        };

        expect(
            getActiveRollSides({
                ...closed,
                open: true,
                mode: "request",
                d20Rolls: [14],
                request,
            })
        ).toBe(8);

        expect(
            getActiveRollSides({
                ...closed,
                open: true,
                mode: "request",
                d20Rolls: [14],
                request: { ...request, damage: {} },
            })
        ).toBeNull();
    });

    it("uses d20 for a death save until the outcome step", () => {
        const request = {
            kind: "death_save" as const,
            id: "death-save:hero",
            label: "Death saves",
            characterId: "hero",
            die: 20 as const,
        };

        expect(
            getActiveRollSides({
                ...closed,
                open: true,
                mode: "request",
                request,
            })
        ).toBe(20);

        expect(
            getActiveRollSides({
                ...closed,
                open: true,
                mode: "request",
                d20Rolls: [10],
                request,
            })
        ).toBeNull();
    });

    it("uses the hit die faces", () => {
        expect(
            getActiveRollSides({
                ...closed,
                open: true,
                mode: "request",
                request: {
                    kind: "hit_die",
                    id: "hit-die:hero",
                    label: "Hit dice",
                    characterId: "hero",
                    die: 10,
                },
            })
        ).toBe(10);
    });

    it("uses the current damage_only step sides", () => {
        expect(
            getActiveRollSides({
                ...closed,
                open: true,
                mode: "request",
                stepIndex: 1,
                request: {
                    kind: "damage_only",
                    id: "spell:fireball",
                    label: "Fireball",
                    steps: [{ sides: 6 }, { sides: 8 }, { sides: 6 }],
                },
            })
        ).toBe(8);
    });
});
