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
import type { RollRequest } from "@/lib/roll/rollRequest.types";

export type RollAssistantMode = "manual" | "request";

type RollAssistantState = {
    open: boolean;
    mode: RollAssistantMode;
    request: RollRequest | null;
    selectedDie: DieSides | null;
    stepIndex: number;
    attackRoll: number | null;
    damageRolls: number[];
};

type RollAssistantContextValue = {
    state: RollAssistantState;
    openManualRoll: () => void;
    openRollRequest: (request: RollRequest) => void;
    selectDie: (sides: DieSides) => void;
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
};

type RollAssistantAction =
    | { type: "open_manual" }
    | { type: "open_request"; request: RollRequest }
    | { type: "select_die"; sides: DieSides }
    | { type: "submit_value"; value: number }
    | { type: "close" };

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
                selectedDie:
                    action.request.kind === "d20_test"
                        ? action.request.die
                        : null,
            };
        case "select_die":
            return {
                ...state,
                selectedDie: action.sides,
            };
        case "submit_value": {
            if (!state.request || state.mode !== "request") {
                return state;
            }

            if (state.request.kind === "d20_test") {
                return initialState;
            }

            if (state.request.kind === "attack_then_damage") {
                if (state.stepIndex === 0) {
                    return {
                        ...state,
                        stepIndex: 1,
                        attackRoll: action.value,
                    };
                }

                return initialState;
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

    if (state.request.kind === "d20_test") {
        return "complete";
    }

    if (state.request.kind === "attack_then_damage") {
        return state.stepIndex === 0 ? "continue" : "complete";
    }

    if (state.request.kind === "damage_only") {
        return state.stepIndex + 1 < state.request.steps.length
            ? "continue"
            : "complete";
    }

    return "complete";
}

const RollAssistantContext = createContext<RollAssistantContextValue | null>(
    null
);

export function RollAssistantProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const openManualRoll = useCallback(() => {
        dispatch({ type: "open_manual" });
    }, []);

    const openRollRequest = useCallback((request: RollRequest) => {
        dispatch({ type: "open_request", request });
    }, []);

    const selectDie = useCallback((sides: DieSides) => {
        dispatch({ type: "select_die", sides });
    }, []);

    const submitRollValue = useCallback((value: number): "continue" | "complete" => {
        const result = getSubmitResult(state, value);
        dispatch({ type: "submit_value", value });
        return result;
    }, [state]);

    const close = useCallback(() => {
        dispatch({ type: "close" });
    }, []);

    const value = useMemo(
        () => ({
            state,
            openManualRoll,
            openRollRequest,
            selectDie,
            submitRollValue,
            close,
        }),
        [state, openManualRoll, openRollRequest, selectDie, submitRollValue, close]
    );

    return (
        <RollAssistantContext.Provider value={value}>
            {children}
        </RollAssistantContext.Provider>
    );
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

    if (state.request.kind === "d20_test") {
        return state.request.die;
    }

    if (state.request.kind === "attack_then_damage") {
        return state.stepIndex === 0 ? 20 : state.request.damage.sides ?? null;
    }

    if (state.request.kind === "damage_only") {
        return state.request.steps[state.stepIndex]?.sides ?? null;
    }

    return null;
}
