/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { emptyInventory } from "@rpv/domain";
import { useGrantPickSanitizer } from "../lib/character/useGrantPickSanitizer";

const baseAttributes = [
    { name: "strength", value: 10 },
    { name: "dexterity", value: 10 },
    { name: "constitution", value: 14 },
    { name: "intelligence", value: 10 },
    { name: "wisdom", value: 10 },
    { name: "charisma", value: 10 },
];

const fighterEquipmentPicks = {
    "class:fighter:base:exclusive:starting-wealth": "equipment",
    "class:fighter:base:inventory_item:5:0": "0",
    "class:fighter:base:inventory_item:6:0": "0",
    "class:fighter:base:inventory_item:7:0": "0",
};

function useFormWithSanitizer(defaultValues: Record<string, unknown>) {
    const form = useForm({ defaultValues });
    useGrantPickSanitizer(form, "en", "dnd");
    return form;
}

describe("useGrantPickSanitizer", () => {
    it("rematerializes bag when sidearm pick is added", async () => {
        const { result } = renderHook(() =>
            useFormWithSanitizer({
                name: "Test",
                characterClass: "fighter",
                level: 1,
                attributes: baseAttributes,
                choices: { grantPicks: fighterEquipmentPicks },
                inventory: emptyInventory(),
            })
        );

        await waitFor(() => {
            const bag = result.current.getValues("inventory")?.bag ?? [];
            expect(
                bag.some((stack) => stack.slug === "srd_longsword")
            ).toBe(true);
        });

        act(() => {
            result.current.setValue("choices", {
                grantPicks: {
                    ...fighterEquipmentPicks,
                    "class:fighter:base:inventory_item:8:0": "0",
                },
            });
        });

        await waitFor(() => {
            const bag = result.current.getValues("inventory")?.bag ?? [];
            expect(bag).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ slug: "srd_crossbow-light" }),
                ])
            );
        });
    });

    it("clears granted bag when switching from equipment to gold branch", async () => {
        const { result } = renderHook(() =>
            useFormWithSanitizer({
                name: "Test",
                characterClass: "fighter",
                level: 1,
                attributes: baseAttributes,
                choices: {
                    grantPicks: {
                        ...fighterEquipmentPicks,
                        "class:fighter:base:inventory_item:8:0": "0",
                    },
                },
                inventory: emptyInventory(),
            })
        );

        await waitFor(() => {
            expect(
                result.current.getValues("inventory")?.bag?.some(
                    (stack) => stack.slug === "srd_longsword"
                )
            ).toBe(true);
        });

        act(() => {
            result.current.setValue("choices", {
                grantPicks: {
                    "class:fighter:base:exclusive:starting-wealth": "gold",
                },
            });
        });

        await waitFor(() => {
            const bag = result.current.getValues("inventory")?.bag ?? [];
            expect(
                bag.some((stack) => stack.slug === "srd_longsword")
            ).toBe(false);
            expect(result.current.getValues("choices")?.grantPicks).toEqual({
                "class:fighter:base:exclusive:starting-wealth": "gold",
            });
        });
    });
});
