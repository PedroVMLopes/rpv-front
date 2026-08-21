import { getActiveRollSides } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";

const closed = {
    open: false,
    mode: "manual" as const,
    request: null,
    selectedDie: 20 as const,
    stepIndex: 0,
    attackRoll: null,
    damageRolls: [] as number[],
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
                stepIndex: 1,
                request,
            })
        ).toBe(8);

        expect(
            getActiveRollSides({
                ...closed,
                open: true,
                mode: "request",
                stepIndex: 1,
                request: { ...request, damage: {} },
            })
        ).toBeNull();
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
