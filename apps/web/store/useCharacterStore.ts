import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
    CharacterProps,
    CharacterType,
    Stats,
} from "@rpv/domain";
import { SystemKey } from "@/presets";
import {
    flattenStoredToForm,
    getResolvedStatsForCharacter,
    normalizeStoredCharacter,
    storedCharacterToProps,
} from "@/lib/character/characterAdapter";
import {
    buildNewStoredCharacter,
    rebuildStoredCharacter,
} from "@/lib/character/buildCharacter";
import { getResourceMax } from "@/lib/character/presetStats";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useContentLocale } from "@/store/useContentLocale";

export type { CharacterType };
export type { StoredCharacter };

/** @deprecated Use StoredCharacter */
export type Character = StoredCharacter;

interface CharacterStore {
    characters: StoredCharacter[];
    addCharacter: (
        formData: Record<string, unknown>,
        type: CharacterType,
        system: SystemKey
    ) => void;
    removeCharacter: (id: string) => void;
    clearCharacters: () => void;
    updateCharacter: (id: string, formData: Record<string, unknown>) => void;
    updateResource: (id: string, resourceName: string, delta: number) => void;
    getResolvedStats: (id: string) => Stats | undefined;
    getCharacterProps: (id: string) => CharacterProps | undefined;
    getFormDefaults: (id: string) => Record<string, unknown> | undefined;
}

export const useCharacterStore = create<CharacterStore>()(
    persist(
        (set, get) => ({
            characters: [],

            addCharacter: (formData, type, system) =>
                set((state) => ({
                    characters: [
                        ...state.characters,
                        buildNewStoredCharacter(
                            formData,
                            type,
                            system,
                            useContentLocale.getState().contentLocale
                        ),
                    ],
                })),

            removeCharacter: (id) =>
                set((state) => ({
                    characters: state.characters.filter((c) => c.id !== id),
                })),

            clearCharacters: () => set({ characters: [] }),

            updateCharacter: (id, formData) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;

                        return rebuildStoredCharacter(
                            char,
                            formData,
                            useContentLocale.getState().contentLocale
                        );
                    }),
                })),

            updateResource: (id, resourceName, delta) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;

                        const current = char.resources[resourceName] ?? 0;
                        const max = getResourceMax(char, resourceName);
                        const next = current + delta;
                        const clamped =
                            max !== undefined
                                ? Math.max(0, Math.min(next, max))
                                : Math.max(0, next);

                        return {
                            ...char,
                            resources: {
                                ...char.resources,
                                [resourceName]: clamped,
                            },
                        };
                    }),
                })),

            getResolvedStats: (id) => {
                const char = get().characters.find((c) => c.id === id);
                if (!char) return undefined;
                return getResolvedStatsForCharacter(storedCharacterToProps(char));
            },

            getCharacterProps: (id) => {
                const char = get().characters.find((c) => c.id === id);
                if (!char) return undefined;
                return storedCharacterToProps(char);
            },

            getFormDefaults: (id) => {
                const char = get().characters.find((c) => c.id === id);
                if (!char) return undefined;
                return flattenStoredToForm(char, char.system);
            },
        }),
        {
            name: "character-storage",
            merge: (persisted, current) => {
                const state = persisted as CharacterStore | undefined;
                if (!state?.characters) return current;

                return {
                    ...current,
                    characters: state.characters.map((char) =>
                        normalizeStoredCharacter(char)
                    ),
                };
            },
        }
    )
);
