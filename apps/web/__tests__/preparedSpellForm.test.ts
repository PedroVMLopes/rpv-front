/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useForm } from "react-hook-form";
import {
    readPreparedSpellsFromForm,
    setPreparedSpells,
    togglePreparedSpell,
} from "../lib/character/preparedSpellForm";

describe("preparedSpellForm", () => {
    it("merges preparedSpells without wiping grantPicks", () => {
        const { result } = renderHook(() =>
            useForm({
                defaultValues: {
                    choices: {
                        grantPicks: {
                            "class:wizard:1:spell:2:0": "burning-hands",
                        },
                    },
                },
            })
        );

        act(() => {
            setPreparedSpells(result.current, ["magic-missile"]);
        });

        expect(result.current.getValues("choices")).toEqual({
            grantPicks: {
                "class:wizard:1:spell:2:0": "burning-hands",
            },
            preparedSpells: ["magic-missile"],
        });
    });

    it("toggles prepared spells on and off", () => {
        const { result } = renderHook(() =>
            useForm({
                defaultValues: {
                    choices: {
                        grantPicks: {},
                        preparedSpells: [],
                    },
                },
            })
        );

        act(() => {
            togglePreparedSpell(result.current, "burning-hands");
            togglePreparedSpell(result.current, "magic-missile");
        });

        expect(readPreparedSpellsFromForm(result.current)).toEqual([
            "burning-hands",
            "magic-missile",
        ]);

        act(() => {
            togglePreparedSpell(result.current, "burning-hands");
        });

        expect(readPreparedSpellsFromForm(result.current)).toEqual([
            "magic-missile",
        ]);
    });

    it("no-ops when adding beyond quota", () => {
        const { result } = renderHook(() =>
            useForm({
                defaultValues: {
                    choices: {
                        grantPicks: {},
                        preparedSpells: ["burning-hands"],
                    },
                },
            })
        );

        act(() => {
            togglePreparedSpell(result.current, "magic-missile", { quota: 1 });
        });

        expect(readPreparedSpellsFromForm(result.current)).toEqual([
            "burning-hands",
        ]);
    });
});
