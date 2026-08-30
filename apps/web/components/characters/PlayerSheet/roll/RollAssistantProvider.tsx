"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useReducer,
    type ReactNode,
} from "react";
import type { DieSides } from "@/lib/roll/diceRoll";
import { ROLLABLE_DICE } from "@/lib/roll/diceRoll";
import type { RollRequest } from "@/lib/roll/rollRequest.types";
import {
    appliesToOf,
    d20Needed,
    defaultAdvantageMode,
    extraDiceSidesFor,
    pickD20,
    type D20RollMode,
} from "@/lib/roll/rollRiders";
import { collectRollEffectsFromActiveConditions } from "@/lib/character/conditionRollEffects";
import {
    getMetaPoint,
    INSPIRATION_REF,
} from "@/lib/character/sessionMetaPoints";
import { useCharacterStore } from "@/store/useCharacterStore";

export type RollAssistantMode = "manual" | "request";

export type RequestPhase =
    | { type: "d20"; index: number; of: number }
    | { type: "extra_die"; sides: DieSides; index: number }
    | { type: "attack_damage" }
    | { type: "damage_only"; index: number }
    | { type: "hit_die" }
    | { type: "death_save_outcome" };

export type RollAssistantState = {
    open: boolean;
    mode: RollAssistantMode;
    request: RollRequest | null;
    selectedDie: DieSides | null;
    stepIndex: number;
    attackRoll: number | null;
    damageRolls: number[];
    d20RollMode: D20RollMode;
    d20Rolls: number[];
    extraDice: number[];
    extraDieRolls: number[];
};

type RollAssistantContextValue = {
    state: RollAssistantState;
    characterId?: string;
    hasInspirationAvailable: boolean;
    openManualRoll: () => void;
    openRollRequest: (request: RollRequest) => void;
    selectDie: (sides: DieSides) => void;
    setD20RollMode: (mode: D20RollMode) => void;
    /** @deprecated Use setD20RollMode */
    setAdvantageMode: (mode: D20RollMode) => void;
    submitRollValue: (value: number) => "continue" | "complete";
    close: () => void;
};

const initialState: RollAssistantState = {
    open: false,
    mode: "manual",
    request: null,
    selectedDie: null,
    stepIndex: 0,
    attackRoll: null,
    damageRolls: [],
    d20RollMode: "normal",
    d20Rolls: [],
    extraDice: [],
    extraDieRolls: [],
};

type RollAssistantAction =
    | { type: "open_manual" }
    | {
          type: "open_request";
          request: RollRequest;
          d20RollMode: D20RollMode;
          extraDice: number[];
      }
    | { type: "select_die"; sides: DieSides }
    | { type: "set_d20_roll_mode"; mode: D20RollMode }
    | { type: "submit_value"; value: number }
    | { type: "close" };

function toDieSides(sides: number): DieSides | null {
    return (ROLLABLE_DICE as readonly number[]).includes(sides)
        ? (sides as DieSides)
        : null;
}

export function getRequestPhase(
    state: Pick<
        RollAssistantState,
        | "request"
        | "d20RollMode"
        | "d20Rolls"
        | "extraDice"
        | "extraDieRolls"
        | "stepIndex"
    >
): RequestPhase | null {
    const { request } = state;
    if (!request) {
        return null;
    }

    if (request.kind === "damage_only") {
        return { type: "damage_only", index: state.stepIndex };
    }

    if (request.kind === "hit_die") {
        return { type: "hit_die" };
    }

    if (
        request.kind === "d20_test" ||
        request.kind === "attack_then_damage" ||
        request.kind === "death_save"
    ) {
        const needed = d20Needed(state.d20RollMode);
        if (state.d20Rolls.length < needed) {
            return {
                type: "d20",
                index: state.d20Rolls.length,
                of: needed,
            };
        }

        if (state.extraDieRolls.length < state.extraDice.length) {
            const sides = toDieSides(
                state.extraDice[state.extraDieRolls.length] ?? 4
            );
            return {
                type: "extra_die",
                sides: sides ?? 4,
                index: state.extraDieRolls.length,
            };
        }

        if (request.kind === "attack_then_damage") {
            return { type: "attack_damage" };
        }

        if (request.kind === "death_save") {
            return { type: "death_save_outcome" };
        }
    }

    return null;
}

function appendRollValue(
    state: RollAssistantState,
    value: number
): Pick<RollAssistantState, "d20Rolls" | "extraDieRolls"> {
    const phase = getRequestPhase(state);
    if (phase?.type === "d20") {
        return {
            d20Rolls: [...state.d20Rolls, value],
            extraDieRolls: state.extraDieRolls,
        };
    }

    if (phase?.type === "extra_die") {
        return {
            d20Rolls: state.d20Rolls,
            extraDieRolls: [...state.extraDieRolls, value],
        };
    }

    return {
        d20Rolls: state.d20Rolls,
        extraDieRolls: state.extraDieRolls,
    };
}

function reducer(
    state: RollAssistantState,
    action: RollAssistantAction
): RollAssistantState {
    switch (action.type) {
        case "open_manual":
            return {
                ...initialState,
                open: true,
                mode: "manual",
            };
        case "open_request":
            return {
                ...initialState,
                open: true,
                mode: "request",
                request: action.request,
                d20RollMode: action.d20RollMode,
                extraDice: action.extraDice,
                selectedDie:
                    action.request.kind === "d20_test" ||
                    action.request.kind === "death_save"
                        ? action.request.die
                        : action.request.kind === "hit_die"
                          ? action.request.die
                          : null,
            };
        case "select_die":
            return {
                ...state,
                selectedDie: action.sides,
            };
        case "set_d20_roll_mode": {
            if (state.d20Rolls.length > 0 || state.extraDieRolls.length > 0) {
                return state;
            }

            return {
                ...state,
                d20RollMode: action.mode,
            };
        }
        case "submit_value": {
            if (!state.request || state.mode !== "request") {
                return state;
            }

            if (state.request.kind === "damage_only") {
                const damageRolls = [...state.damageRolls, action.value];
                const nextStepIndex = state.stepIndex + 1;

                if (nextStepIndex < state.request.steps.length) {
                    return {
                        ...state,
                        stepIndex: nextStepIndex,
                        damageRolls,
                    };
                }

                return initialState;
            }

            if (state.request.kind === "hit_die") {
                return initialState;
            }

            if (state.request.kind === "death_save") {
                const nextRolls = appendRollValue(state, action.value);
                return { ...state, ...nextRolls };
            }

            if (state.request.kind === "attack_then_damage") {
                const phase = getRequestPhase(state);
                const nextRolls = appendRollValue(state, action.value);
                const nextState = { ...state, ...nextRolls };
                const nextPhase = getRequestPhase(nextState);

                if (phase?.type === "d20" || phase?.type === "extra_die") {
                    if (nextPhase?.type === "attack_damage") {
                        return {
                            ...nextState,
                            attackRoll: pickD20(
                                nextState.d20Rolls,
                                state.d20RollMode
                            ),
                        };
                    }

                    return nextState;
                }

                return initialState;
            }

            if (state.request.kind === "d20_test") {
                const nextRolls = appendRollValue(state, action.value);
                const nextState = { ...state, ...nextRolls };
                return getRequestPhase(nextState) ? nextState : initialState;
            }

            return state;
        }
        case "close":
            return initialState;
        default:
            return state;
    }
}

function getSubmitResult(
    state: RollAssistantState,
    value: number
): "continue" | "complete" {
    if (!state.request || state.mode !== "request") {
        return "complete";
    }

    if (state.request.kind === "damage_only") {
        return state.stepIndex + 1 < state.request.steps.length
            ? "continue"
            : "complete";
    }

    if (state.request.kind === "hit_die") {
        return "complete";
    }

    if (state.request.kind === "death_save") {
        const next = { ...state, ...appendRollValue(state, value) };
        return getRequestPhase(next)?.type === "death_save_outcome"
            ? "continue"
            : "complete";
    }

    if (state.request.kind === "d20_test") {
        const next = { ...state, ...appendRollValue(state, value) };
        return getRequestPhase(next) ? "continue" : "complete";
    }

    if (state.request.kind === "attack_then_damage") {
        const phase = getRequestPhase(state);
        if (phase?.type === "d20" || phase?.type === "extra_die") {
            return "continue";
        }

        return "complete";
    }

    return "complete";
}

const RollAssistantContext = createContext<RollAssistantContextValue | null>(
    null
);

type RollAssistantProviderProps = {
    children: ReactNode;
    characterId?: string;
};

export function RollAssistantProvider({
    children,
    characterId,
}: RollAssistantProviderProps) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const character = useCharacterStore((store) =>
        characterId
            ? store.characters.find((entry) => entry.id === characterId)
            : undefined
    );

    const hasInspirationAvailable =
        getMetaPoint(character?.session, INSPIRATION_REF) > 0;

    const openManualRoll = useCallback(() => {
        dispatch({ type: "open_manual" });
    }, []);

    const openRollRequest = useCallback(
        (request: RollRequest) => {
            let d20RollMode: D20RollMode = "normal";
            let extraDice: number[] = [];

            if (characterId) {
                const currentCharacter = useCharacterStore
                    .getState()
                    .characters.find((entry) => entry.id === characterId);
                const effects = collectRollEffectsFromActiveConditions(
                    currentCharacter?.session?.activeConditions,
                    currentCharacter?.system ?? "dnd"
                );
                const appliesTo = appliesToOf(request);
                d20RollMode = defaultAdvantageMode(effects, appliesTo);
                extraDice = extraDiceSidesFor(effects, appliesTo);
            }

            dispatch({
                type: "open_request",
                request,
                d20RollMode,
                extraDice,
            });
        },
        [characterId]
    );

    const selectDie = useCallback((sides: DieSides) => {
        dispatch({ type: "select_die", sides });
    }, []);

    const setD20RollMode = useCallback((mode: D20RollMode) => {
        dispatch({ type: "set_d20_roll_mode", mode });
    }, []);

    const submitRollValue = useCallback(
        (value: number): "continue" | "complete" => {
            const result = getSubmitResult(state, value);
            dispatch({ type: "submit_value", value });
            return result;
        },
        [state]
    );

    const close = useCallback(() => {
        dispatch({ type: "close" });
    }, []);

    const value = useMemo(
        () => ({
            state,
            characterId,
            hasInspirationAvailable,
            openManualRoll,
            openRollRequest,
            selectDie,
            setD20RollMode,
            setAdvantageMode: setD20RollMode,
            submitRollValue,
            close,
        }),
        [
            state,
            characterId,
            hasInspirationAvailable,
            openManualRoll,
            openRollRequest,
            selectDie,
            setD20RollMode,
            submitRollValue,
            close,
        ]
    );

    return (
        <RollAssistantContext.Provider value={value}>
            {children}
        </RollAssistantContext.Provider>
    );
}

export function useOptionalRollAssistant(): RollAssistantContextValue | null {
    return useContext(RollAssistantContext);
}

export function useRollAssistant(): RollAssistantContextValue {
    const context = useContext(RollAssistantContext);

    if (!context) {
        throw new Error(
            "useRollAssistant must be used within RollAssistantProvider"
        );
    }

    return context;
}

export function getActiveRollSides(
    state: RollAssistantState
): DieSides | null {
    if (!state.open) {
        return null;
    }

    if (state.mode === "manual") {
        return state.selectedDie;
    }

    if (!state.request) {
        return null;
    }

    const phase = getRequestPhase(state);

    if (phase?.type === "d20") {
        return 20;
    }

    if (phase?.type === "extra_die") {
        return phase.sides;
    }

    if (phase?.type === "attack_damage") {
        return state.request.kind === "attack_then_damage"
            ? (state.request.damage.sides ?? null)
            : null;
    }

    if (state.request.kind === "damage_only") {
        return state.request.steps[state.stepIndex]?.sides ?? null;
    }

    if (state.request.kind === "hit_die") {
        return state.request.die;
    }

    return null;
}
