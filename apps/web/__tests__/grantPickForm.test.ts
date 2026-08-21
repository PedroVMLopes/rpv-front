/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { readGrantPicks, setGrantPick } from "../lib/character/grantPickForm";

describe("readGrantPicks", () => {
    it("returns an empty object when choices or grantPicks are missing", () => {
        const missingChoices = renderHook(() =>
            useForm<Record<string, unknown>>({ defaultValues: {} })
        );
        expect(readGrantPicks(missingChoices.result.current)).toEqual({});

        const missingPicks = renderHook(() =>
            useForm<Record<string, unknown>>({
                defaultValues: { choices: {} },
            })
        );
        expect(readGrantPicks(missingPicks.result.current)).toEqual({});
    });

    it("reads existing grantPicks from the form", () => {
        const { result } = renderHook(() =>
            useForm<Record<string, unknown>>({
                defaultValues: {
                    choices: {
                        grantPicks: {
                            "race:elf:base:language:0:0": "draconic",
                        },
                    },
                },
            })
        );

        expect(readGrantPicks(result.current)).toEqual({
            "race:elf:base:language:0:0": "draconic",
        });
    });
});

describe("setGrantPick", () => {
    it("merges a pick without dropping preparedSpells or sibling picks", () => {
        const { result } = renderHook(() =>
            useForm<Record<string, unknown>>({
                defaultValues: {
                    choices: {
                        grantPicks: {
                            "class:wizard:1:spell:1:0": "fire-bolt",
                        },
                        preparedSpells: ["burning-hands"],
                    },
                },
            })
        );

        act(() => {
            setGrantPick(
                result.current,
                "class:wizard:1:spell:2:0",
                "magic-missile"
            );
        });

        expect(result.current.getValues("choices")).toEqual({
            grantPicks: {
                "class:wizard:1:spell:1:0": "fire-bolt",
                "class:wizard:1:spell:2:0": "magic-missile",
            },
            preparedSpells: ["burning-hands"],
        });
    });

    it("overwrites an existing pick key", () => {
        const { result } = renderHook(() =>
            useForm<Record<string, unknown>>({
                defaultValues: {
                    choices: {
                        grantPicks: {
                            "race:high-elf:base:spell:0:0": "fire-bolt",
                        },
                    },
                },
            })
        );

        act(() => {
            setGrantPick(
                result.current,
                "race:high-elf:base:spell:0:0",
                "mage-hand"
            );
        });

        expect(readGrantPicks(result.current)).toEqual({
            "race:high-elf:base:spell:0:0": "mage-hand",
        });
    });

    it("creates choices.grantPicks when the form has no choices yet", () => {
        const { result } = renderHook(() =>
            useForm<Record<string, unknown>>({ defaultValues: {} })
        );

        act(() => {
            setGrantPick(
                result.current,
                "class:fighter:base:skill_proficiency:3:0",
                "athletics"
            );
        });

        expect(readGrantPicks(result.current)).toEqual({
            "class:fighter:base:skill_proficiency:3:0": "athletics",
        });
    });
});
