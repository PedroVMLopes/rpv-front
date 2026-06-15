import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CharacterProps, CharacterType, Stats } from "@rpv/domain";
import { SystemKey } from "@/presets";
import {
    flattenStoredToForm,
    formDataToStoredCharacter,
    getResolvedStatsForCharacter,
    normalizeStoredCharacter,
    storedCharacterToProps,
    buildSelectionsFromForm,
} from "@/lib/character/characterAdapter";
import { deriveRaceModifiers } from "@/lib/character/raceModifiers";
import {
    deriveCharacterGrants,
    grantContextFromForm,
} from "@/lib/character/characterGrants";
import {
    deriveMaxHpFromForm,
    isMaxHpEmpty,
} from "@/lib/character/hp";
import { useContentLocale } from "@/store/useContentLocale";
import { removeModifiersBySource } from "@rpv/domain";
import { getResourceMax } from "@/lib/character/presetStats";
import type { StoredCharacter } from "@/lib/character/storedCharacter";

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

const createStoredCharacter = (
    formData: Record<string, unknown>,
    type: CharacterType,
    system: SystemKey
): StoredCharacter => {
    const id = crypto.randomUUID();
    const selections = buildSelectionsFromForm(formData);
    const contentLocale = useContentLocale.getState().contentLocale;
    const modifiers = deriveRaceModifiers(selections, contentLocale);
    const grants = deriveCharacterGrants(
        selections,
        grantContextFromForm(formData),
        contentLocale
    );

    const processedForm = applyDerivedMaxHp(formData, system, contentLocale);

    return formDataToStoredCharacter(
        processedForm,
        id,
        type,
        system,
        modifiers,
        selections,
        grants
    );
};

function applyDerivedMaxHp(
    formData: Record<string, unknown>,
    system: SystemKey,
    contentLocale: ReturnType<typeof useContentLocale.getState>["contentLocale"]
): Record<string, unknown> {
    if (!isMaxHpEmpty(formData.maxHp)) {
        return formData;
    }

    const derivedMaxHp = deriveMaxHpFromForm(formData, system, contentLocale);
    if (derivedMaxHp === undefined) {
        return formData;
    }

    const processedForm: Record<string, unknown> = {
        ...formData,
        maxHp: derivedMaxHp,
    };

    if (isMaxHpEmpty(formData.hp)) {
        processedForm.hp = derivedMaxHp;
    }

    return processedForm;
}

function rebuildCharacterFromForm(
    char: StoredCharacter,
    formData: Record<string, unknown>
): StoredCharacter {
    const selections = buildSelectionsFromForm(formData, char.selections);
    const contentLocale = useContentLocale.getState().contentLocale;
    const context = grantContextFromForm(formData);
    const raceModifiers = deriveRaceModifiers(selections, contentLocale);
    const preservedModifiers = removeModifiersBySource(char.modifiers, {
        type: "race",
    });
    const modifiers = [...preservedModifiers, ...raceModifiers];
    const grants = deriveCharacterGrants(selections, context, contentLocale);
    const processedForm = applyDerivedMaxHp(formData, char.system, contentLocale);

    return formDataToStoredCharacter(
        processedForm,
        char.id,
        char.type,
        char.system,
        modifiers,
        selections,
        grants
    );
}

export const useCharacterStore = create<CharacterStore>()(
    persist(
        (set, get) => ({
            characters: [],

            addCharacter: (formData, type, system) =>
                set((state) => ({
                    characters: [
                        ...state.characters,
                        createStoredCharacter(formData, type, system),
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

                        return rebuildCharacterFromForm(char, formData);
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
