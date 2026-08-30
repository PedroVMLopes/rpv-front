import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
    CharacterInventory,
    CharacterProps,
    CharacterType,
    Stats,
} from "@rpv/domain";
import { emptyInventory } from "@rpv/domain";
import { SystemKey } from "@/presets";
import {
    flattenStoredToForm,
    getResolvedStatsForCharacter,
    storedCharacterToProps,
} from "@/lib/character/characterAdapter";
import {
    buildNewStoredCharacter,
    loadStoredCharacter,
    rebuildCharacterWithInventory,
    rebuildStoredCharacter,
} from "@/lib/character/buildCharacter";
import { readLevelFromForm } from "@/lib/character/level";
import { collectArmorClassFormulaGrants } from "@/lib/character/characterGrants";
import { readCharacterLevel } from "@/lib/character/skillModifiers";
import { resolveInventoryGrantProvenance } from "@/lib/character/materializeInventoryGrants";
import {
    addToBag as addToBagInventory,
    deleteInventoryItem as deleteInventoryItemInventory,
    type DeleteInventoryItemInput,
    equipItem as equipItemInventory,
    removeFromBag as removeFromBagInventory,
    setBagQuantity as setBagQuantityInventory,
    unequipItem as unequipItemInventory,
    unequipItemFromMultiSlot as unequipItemFromMultiSlotInventory,
} from "@/lib/character/inventory";
import { getResourceMax } from "@/lib/character/presetStats";
import {
    adjustCurrencyAmount,
    setCurrencyAmount,
} from "@/lib/character/materializeCurrencyGrants";
import { applyRest as applyRestResources, type RestKind } from "@/lib/character/applyRest";
import {
    applyVitalityToCharacter,
    type VitalityChange,
} from "@/lib/character/vitality";
import { getSystemRules } from "@/lib/character/systemRules";
import {
    createCharacterNote,
    updateCharacterNote,
    type NoteColorChoice,
} from "@/lib/character/notes";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import type { CharacterSession } from "@/lib/character/storedCharacter";
import { mergeCharacterSession } from "@/lib/character/session";
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
    unequipItemFromMultiSlot: (
        id: string,
        slotId: string,
        slug: string
    ) => void;
    addToBag: (id: string, slug: string, quantity?: number) => void;
    removeFromBag: (id: string, slug: string, quantity?: number) => void;
    setBagQuantity: (id: string, slug: string, quantity: number) => void;
    deleteInventoryItem: (id: string, input: DeleteInventoryItemInput) => void;
    unequipItemToBag: (
        id: string,
        slotId: string,
        restoredQuantity?: number,
        multiSlug?: string
    ) => void;
    updateResource: (id: string, resourceName: string, delta: number) => void;
    setCurrency: (id: string, ref: string, amount: number) => void;
    adjustCurrency: (id: string, ref: string, delta: number) => void;
    applyVitalityChange: (id: string, change: VitalityChange) => void;
    applyRest: (id: string, kind: RestKind) => void;
    addNote: (id: string, body: string) => void;
    updateNote: (
        id: string,
        noteId: string,
        body: string,
        color?: NoteColorChoice
    ) => void;
    deleteNote: (id: string, noteId: string) => void;
    setCharacterSession: (id: string, patch: CharacterSession) => void;
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

            unequipItemFromMultiSlot: (id, slotId, slug) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;

                        const locale = useContentLocale.getState().contentLocale;
                        const level = readLevelFromForm(
                            flattenStoredToForm(char, char.system)
                        );
                        const provenance = resolveInventoryGrantProvenance(
                            char.selections,
                            slug,
                            locale,
                            char.system,
                            level
                        );
                        const nextInventory = unequipItemFromMultiSlotInventory(
                            char.selections.inventory,
                            slotId,
                            slug,
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

            setBagQuantity: (id, slug, quantity) =>
                updateCharacterInventory(set, get, id, (inventory, system) =>
                    setBagQuantityInventory(inventory, slug, quantity, system)
                ),

            deleteInventoryItem: (id, input) =>
                updateCharacterInventory(set, get, id, (inventory) =>
                    deleteInventoryItemInventory(inventory, input)
                ),

            unequipItemToBag: (id, slotId, restoredQuantity = 1, multiSlug) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;

                        const locale = useContentLocale.getState().contentLocale;
                        const level = readLevelFromForm(
                            flattenStoredToForm(char, char.system)
                        );
                        const slug =
                            multiSlug ??
                            char.selections.inventory.equipped[slotId];
                        const provenance = slug
                            ? resolveInventoryGrantProvenance(
                                  char.selections,
                                  slug,
                                  locale,
                                  char.system,
                                  level
                              )
                            : undefined;

                        const nextInventory = multiSlug
                            ? unequipItemFromMultiSlotInventory(
                                  char.selections.inventory,
                                  slotId,
                                  multiSlug,
                                  char.system,
                                  provenance,
                                  restoredQuantity
                              )
                            : unequipItemInventory(
                                  char.selections.inventory,
                                  slotId,
                                  char.system,
                                  provenance,
                                  restoredQuantity
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

            setCurrency: (id, ref, amount) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;

                        return {
                            ...char,
                            selections: {
                                ...char.selections,
                                currency: setCurrencyAmount(
                                    char.selections.currency,
                                    ref,
                                    amount
                                ),
                            },
                        };
                    }),
                })),

            adjustCurrency: (id, ref, delta) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;

                        return {
                            ...char,
                            selections: {
                                ...char.selections,
                                currency: adjustCurrencyAmount(
                                    char.selections.currency,
                                    ref,
                                    delta
                                ),
                            },
                        };
                    }),
                })),

            applyVitalityChange: (id, change) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) {
                            return char;
                        }

                        const vitality = getSystemRules(char.system).vitality;
                        const maxHp = getResourceMax(char, "hp") ?? 0;
                        const resolved = getResolvedStatsForCharacter(
                            storedCharacterToProps(char),
                            char.selections.inventory,
                            char.system,
                            [],
                            { activeConditions: char.session?.activeConditions }
                        );

                        return applyVitalityToCharacter(char, change, {
                            maxHp,
                            constitution: resolved.constitution,
                            hitDieHeal:
                                vitality?.hitDieHeal ??
                                ((dieRoll) => Math.max(1, dieRoll)),
                            hitDiceRef: vitality?.hitDiceRef ?? "hit-dice",
                        });
                    }),
                })),

            applyRest: (id, kind) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;

                        const vitality = getSystemRules(char.system).vitality;
                        const hitDiceMax = vitality
                            ? getResourceMax(char, vitality.hitDiceRef)
                            : undefined;
                        const resources = applyRestResources(
                            char.resources,
                            char.grants ?? [],
                            kind,
                            {
                                maxHp: getResourceMax(char, "hp"),
                                hitDice:
                                    vitality &&
                                    hitDiceMax !== undefined &&
                                    hitDiceMax > 0
                                        ? {
                                              ref: vitality.hitDiceRef,
                                              max: hitDiceMax,
                                              recover:
                                                  vitality.longRestHitDiceRecover,
                                          }
                                        : undefined,
                            }
                        );
                        const session =
                            kind === "long_rest"
                                ? mergeCharacterSession(char.session, {
                                      tempHp: 0,
                                      deathSaves: null,
                                  })
                                : char.session;

                        return {
                            ...char,
                            resources,
                            session,
                        };
                    }),
                })),

            addNote: (id, body) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;

                        const note = createCharacterNote(body);
                        if (!note) return char;

                        return {
                            ...char,
                            notes: [note, ...(char.notes ?? [])],
                        };
                    }),
                })),

            updateNote: (id, noteId, body, color) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;

                        const notes = char.notes ?? [];
                        const current = notes.find((note) => note.id === noteId);
                        if (!current) return char;

                        const next = updateCharacterNote(current, body, color);
                        if (!next) return char;

                        return {
                            ...char,
                            notes: notes.map((note) =>
                                note.id === noteId ? next : note
                            ),
                        };
                    }),
                })),

            deleteNote: (id, noteId) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;

                        return {
                            ...char,
                            notes: (char.notes ?? []).filter(
                                (note) => note.id !== noteId
                            ),
                        };
                    }),
                })),

            setCharacterSession: (id, patch) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;

                        return {
                            ...char,
                            session: mergeCharacterSession(char.session, patch),
                        };
                    }),
                })),

            getResolvedStats: (id) => {
                const char = get().characters.find((c) => c.id === id);
                if (!char) return undefined;
                return getResolvedStatsForCharacter(
                    storedCharacterToProps(char),
                    char.selections.inventory ?? emptyInventory(),
                    char.system,
                    collectArmorClassFormulaGrants(
                        char.selections,
                        char.language,
                        readCharacterLevel(char.systemData),
                        char.system
                    ),
                    { activeConditions: char.session?.activeConditions }
                );
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
                        loadStoredCharacter(char)
                    ),
                };
            },
        }
    )
);
