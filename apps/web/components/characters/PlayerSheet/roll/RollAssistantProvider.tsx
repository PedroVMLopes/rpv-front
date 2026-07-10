"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
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
};

type RollAssistantContextValue = {
    state: RollAssistantState;
    openManualRoll: () => void;
    openRollRequest: (request: RollRequest) => void;
    selectDie: (sides: DieSides) => void;
    close: () => void;
};

const initialState: RollAssistantState = {
    open: false,
    mode: "manual",
    request: null,
    selectedDie: null,
};

const RollAssistantContext = createContext<RollAssistantContextValue | null>(
    null
);

export function RollAssistantProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<RollAssistantState>(initialState);

    const openManualRoll = useCallback(() => {
        setState({
            open: true,
            mode: "manual",
            request: null,
            selectedDie: null,
        });
    }, []);

    const openRollRequest = useCallback((request: RollRequest) => {
        setState({
            open: true,
            mode: "request",
            request,
            selectedDie: request.kind === "d20_test" ? request.die : null,
        });
    }, []);

    const selectDie = useCallback((sides: DieSides) => {
        setState((current) => ({
            ...current,
            selectedDie: sides,
        }));
    }, []);

    const close = useCallback(() => {
        setState(initialState);
    }, []);

    const value = useMemo(
        () => ({
            state,
            openManualRoll,
            openRollRequest,
            selectDie,
            close,
        }),
        [state, openManualRoll, openRollRequest, selectDie, close]
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
