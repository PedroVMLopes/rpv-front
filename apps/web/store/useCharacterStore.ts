import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
    CharacterInventory,
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
    rebuildCharacterWithInventory,
    rebuildStoredCharacter,
} from "@/lib/character/buildCharacter";
import { readLevelFromForm } from "@/lib/character/level";
import { resolveInventoryGrantProvenance } from "@/lib/character/materializeInventoryGrants";
import {
    addToBag as addToBagInventory,
    equipItem as equipItemInventory,
    removeFromBag as removeFromBagInventory,
    unequipItem as unequipItemInventory,
} from "@/lib/character/inventory";
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
    equipItem: (id: string, slotId: string, slug: string) => void;
    unequipItem: (id: string, slotId: string) => void;
    addToBag: (id: string, slug: string, quantity?: number) => void;
    removeFromBag: (id: string, slug: string, quantity?: number) => void;
    updateResource: (id: string, resourceName: string, delta: number) => void;
    getResolvedStats: (id: string) => Stats | undefined;
    getCharacterProps: (id: string) => CharacterProps | undefined;
    getFormDefaults: (id: string) => Record<string, unknown> | undefined;
}

function updateCharacterInventory(
    set: (
        partial:
            | CharacterStore
            | Partial<CharacterStore>
            | ((state: CharacterStore) => CharacterStore | Partial<CharacterStore>)
    ) => void,
    get: () => CharacterStore,
    id: string,
    transform: (inventory: CharacterInventory, system: SystemKey) => CharacterInventory
) {
    set((state) => ({
        characters: state.characters.map((char) => {
            if (char.id !== id) return char;

            const nextInventory = transform(char.selections.inventory, char.system);
            if (nextInventory === char.selections.inventory) {
                return char;
            }

            return rebuildCharacterWithInventory(
                char,
                nextInventory,
                useContentLocale.getState().contentLocale
            );
        }),
    }));
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

            equipItem: (id, slotId, slug) =>
                updateCharacterInventory(set, get, id, (inventory, system) =>
                    equipItemInventory(inventory, slotId, slug, system)
                ),

            unequipItem: (id, slotId) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;

                        const locale = useContentLocale.getState().contentLocale;
                        const level = readLevelFromForm(
                            flattenStoredToForm(char, char.system)
                        );
                        const slug = char.selections.inventory.equipped[slotId];
                        const provenance = slug
                            ? resolveInventoryGrantProvenance(
                                  char.selections,
                                  slug,
                                  locale,
                                  char.system,
                                  level
                              )
                            : undefined;
                        const nextInventory = unequipItemInventory(
                            char.selections.inventory,
                            slotId,
                            char.system,
                            provenance
                        );

                        if (nextInventory === char.selections.inventory) {
                            return char;
                        }

                        return rebuildCharacterWithInventory(
                            char,
                            nextInventory,
                            locale
                        );
                    }),
                })),

            addToBag: (id, slug, quantity = 1) =>
                updateCharacterInventory(set, get, id, (inventory) =>
                    addToBagInventory(inventory, slug, quantity)
                ),

            removeFromBag: (id, slug, quantity = 1) =>
                updateCharacterInventory(set, get, id, (inventory) =>
                    removeFromBagInventory(inventory, slug, quantity)
                ),

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
