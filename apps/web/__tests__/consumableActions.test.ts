import { createDefaultStats, emptyInventory } from "@rpv/domain";
import {
    listConsumableActions,
    findConsumableAction,
} from "@/lib/character/consumableActions";
import {
    performConsumableUse,
    shouldConsumeOnUseAction,
} from "@/lib/character/useConsumable";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import type { RollRequest } from "@/lib/roll/rollRequest.types";
import { resolveHealTotal } from "@/lib/roll/buildRollRequest";

function baseStored(
    overrides: Partial<StoredCharacter> = {}
): StoredCharacter {
    return {
        id: "char-1",
        schemaVersion: 1,
        type: "player",
        system: "dnd",
        language: "en",
        name: "Test",
        baseStats: {
            ...createDefaultStats(),
            intelligence: 16,
        },
        modifiers: [],
        grants: [],
        resources: {},
        selections: {
            characterClass: "wizard",
            inventory: {
                ...emptyInventory(),
                bag: [{ slug: "rpv_scroll-of-fire-bolt", quantity: 2 }],
            },
            choices: {},
        },
        systemData: {
            characterClass: "wizard",
            level: 1,
        },
        ...overrides,
    };
}

describe("listConsumableActions", () => {
    it("lists scroll cast actions from the bag without permanent spell grants", () => {
        const stored = baseStored();
        const resolved = createDefaultStats();
        const actions = listConsumableActions(stored, resolved);

        expect(actions).toHaveLength(1);
        expect(actions[0]).toEqual(
            expect.objectContaining({
                itemSlug: "rpv_scroll-of-fire-bolt",
                quantity: 2,
                consumeQuantity: 1,
                depleted: false,
                useEffect: { kind: "cast_spell", spellRef: "fire-bolt" },
            })
        );
        expect(actions[0]?.spell?.slug).toBe("fire-bolt");
        expect(actions[0]?.spell?.rollProfile?.mode).toBe("attack");
    });

    it("lists potion heal actions from the bag", () => {
        const stored = baseStored({
            selections: {
                inventory: {
                    ...emptyInventory(),
                    bag: [{ slug: "srd_potion-of-healing", quantity: 3 }],
                },
                choices: {},
            },
        });
        const actions = listConsumableActions(stored, createDefaultStats());
        expect(actions).toHaveLength(1);
        expect(actions[0]).toEqual(
            expect.objectContaining({
                itemSlug: "srd_potion-of-healing",
                quantity: 3,
                consumeQuantity: 1,
                depleted: false,
                useEffect: {
                    kind: "heal",
                    dice: "2d4",
                    flat: 2,
                    healingKind: "hp",
                },
            })
        );
        expect(actions[0]?.spell).toBeUndefined();
    });

    it("marks depleted when bag quantity is insufficient", () => {
        const stored = baseStored({
            selections: {
                inventory: {
                    ...emptyInventory(),
                    bag: [{ slug: "rpv_scroll-of-fire-bolt", quantity: 0 }],
                },
                choices: {},
            },
        });
        const action = findConsumableAction(
            stored,
            createDefaultStats(),
            "rpv_scroll-of-fire-bolt"
        );
        expect(action).toBeUndefined();
    });
});

describe("shouldConsumeOnUseAction", () => {
    it("does not consume damage follow-up when an attack button exists", () => {
        expect(
            shouldConsumeOnUseAction(
                { kind: "roll", role: "damage", label: "1d10" },
                [
                    { kind: "roll", role: "attack", label: "d20" },
                    { kind: "roll", role: "damage", label: "1d10" },
                ]
            )
        ).toBe(false);
    });

    it("consumes attack and damage-only uses", () => {
        expect(
            shouldConsumeOnUseAction(
                { kind: "roll", role: "attack", label: "d20" },
                [
                    { kind: "roll", role: "attack", label: "d20" },
                    { kind: "roll", role: "damage", label: "1d10" },
                ]
            )
        ).toBe(true);
        expect(
            shouldConsumeOnUseAction(
                { kind: "roll", role: "damage", label: "2d6" },
                [{ kind: "roll", role: "damage", label: "2d6" }]
            )
        ).toBe(true);
    });
});

describe("performConsumableUse", () => {
    it("opens an attack roll and consumes quantity", () => {
        const stored = baseStored();
        const resolved = {
            ...createDefaultStats(),
            intelligence: 16,
        };
        const action = findConsumableAction(
            stored,
            resolved,
            "rpv_scroll-of-fire-bolt"
        )!;
        expect(action.spell?.attackModifier).not.toBeNull();

        const rolls: RollRequest[] = [];
        const consumed: Array<{ slug: string; quantity: number }> = [];

        const started = performConsumableUse({
            action,
            useAction: { kind: "roll", role: "attack", label: "d20" },
            allUseActions: [
                { kind: "roll", role: "attack", label: "d20" },
                { kind: "roll", role: "damage", label: "1d10" },
            ],
            system: "dnd",
            characterId: stored.id,
            openRollRequest: (request) => rolls.push(request),
            consume: (slug, quantity) => consumed.push({ slug, quantity }),
        });

        expect(started).toBe(true);
        expect(rolls).toHaveLength(1);
        expect(consumed).toEqual([
            { slug: "rpv_scroll-of-fire-bolt", quantity: 1 },
        ]);
    });

    it("does not consume on damage follow-up", () => {
        const stored = baseStored();
        const action = findConsumableAction(
            stored,
            createDefaultStats(),
            "rpv_scroll-of-fire-bolt"
        )!;
        const consumed: Array<{ slug: string; quantity: number }> = [];

        performConsumableUse({
            action,
            useAction: { kind: "roll", role: "damage", label: "1d10" },
            allUseActions: [
                { kind: "roll", role: "attack", label: "d20" },
                { kind: "roll", role: "damage", label: "1d10" },
            ],
            system: "dnd",
            characterId: stored.id,
            openRollRequest: () => undefined,
            consume: (slug, quantity) => consumed.push({ slug, quantity }),
        });

        expect(consumed).toEqual([]);
    });

    it("opens a heal roll and consumes a potion", () => {
        const stored = baseStored({
            selections: {
                inventory: {
                    ...emptyInventory(),
                    bag: [{ slug: "srd_potion-of-healing", quantity: 2 }],
                },
                choices: {},
            },
        });
        const action = findConsumableAction(
            stored,
            createDefaultStats(),
            "srd_potion-of-healing"
        )!;
        const rolls: RollRequest[] = [];
        const consumed: Array<{ slug: string; quantity: number }> = [];

        const started = performConsumableUse({
            action,
            useAction: { kind: "cast", label: "Use" },
            system: "dnd",
            characterId: stored.id,
            openRollRequest: (request) => rolls.push(request),
            consume: (slug, quantity) => consumed.push({ slug, quantity }),
        });

        expect(started).toBe(true);
        expect(rolls[0]).toEqual(
            expect.objectContaining({
                kind: "heal",
                characterId: "char-1",
                diceCount: 2,
                die: 4,
                flat: 2,
                healingKind: "hp",
            })
        );
        expect(consumed).toEqual([
            { slug: "srd_potion-of-healing", quantity: 1 },
        ]);
        expect(resolveHealTotal({ diceCount: 2, flat: 2 }, [3, 4])).toBe(9);
    });

    it("consumes stub deal_damage / apply_condition uses with toast callback", () => {
        const stored = baseStored({
            selections: {
                inventory: {
                    ...emptyInventory(),
                    bag: [{ slug: "srd_antitoxin-vial", quantity: 1 }],
                },
                choices: {},
            },
        });
        const action = findConsumableAction(
            stored,
            createDefaultStats(),
            "srd_antitoxin-vial"
        )!;
        const consumed: Array<{ slug: string; quantity: number }> = [];
        const toasts: string[] = [];

        const started = performConsumableUse({
            action,
            useAction: { kind: "cast", label: "Use" },
            system: "dnd",
            characterId: stored.id,
            openRollRequest: () => undefined,
            consume: (slug, quantity) => consumed.push({ slug, quantity }),
            manualEffectToast: (label) => toasts.push(label),
        });

        expect(started).toBe(true);
        expect(consumed).toEqual([{ slug: "srd_antitoxin-vial", quantity: 1 }]);
        expect(toasts).toHaveLength(1);
    });
});
