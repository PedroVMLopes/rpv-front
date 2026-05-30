import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import type { BaseStats, CharacterProps, CharacterType, Modifier, Stats } from "@rpv/domain";
import { characterSchemasByType } from "@/presets/dnd/characterSchema";
import { SystemKey } from "@/presets";
import { getDefaultModifiersForCreation } from "@/presets/dnd/modifiers";
import {
    formDataToCharacterProps,
    getResolvedStatsForCharacter,
    syncBaseStatsFromForm,
    type CharacterFormData,
} from "@/lib/character/characterAdapter";

// Data flux
// Form (zod) creates-> PlayerData without an ID
// Generates an unique ID
// Saves everything as a StoredCharacter in the array characters

type PlayerData = z.infer<typeof characterSchemasByType.player>;
type EnemyData = z.infer<typeof characterSchemasByType.enemy>;
type NpcData = z.infer<typeof characterSchemasByType.npc>;
export type { CharacterType };

interface CharacterBase {
    id: string;
    type: CharacterType;
    system: SystemKey;
    baseStats: BaseStats;
    modifiers: Modifier[];
}

type PlayerCharacter = CharacterBase & PlayerData;
type EnemyCharacter = CharacterBase & EnemyData;
type NpcCharacter = CharacterBase & NpcData;

export type StoredCharacter = PlayerCharacter | EnemyCharacter | NpcCharacter;

/** @deprecated Use StoredCharacter */
export type Character = StoredCharacter;

interface CharacterStore {
    characters: StoredCharacter[];
    addCharacter: (data: PlayerData | EnemyData | NpcData, type: CharacterType, system: SystemKey) => void;
    removeCharacter: (id: string) => void;
    clearCharacters: () => void;
    updateCharacter: (id: string, updatedData: Partial<PlayerData | EnemyData | NpcData>) => void;
    updateHp: (id: string, amount: number) => void;
    getResolvedStats: (id: string) => Stats | undefined;
    getCharacterProps: (id: string) => CharacterProps | undefined;
}

function toFormData(data: PlayerData | EnemyData | NpcData): CharacterFormData {
    return {
        name: data.name,
        hp: data.hp,
        maxHp: data.maxHp,
        ac: data.ac,
        attributes: data.attributes,
    };
}

function ensureDomainFields(char: StoredCharacter): StoredCharacter {
    if (char.baseStats && char.modifiers) {
        return char;
    }

    const formData = toFormData(char);
    const domainProps = formDataToCharacterProps(
        formData,
        char.id,
        char.type,
        char.system,
        char.modifiers ?? []
    );

    return {
        ...char,
        baseStats: char.baseStats ?? domainProps.baseStats,
        modifiers: char.modifiers ?? domainProps.modifiers,
    };
}

function storedCharacterToProps(char: StoredCharacter): CharacterProps {
    const normalized = ensureDomainFields(char);
    return {
        id: normalized.id,
        type: normalized.type,
        name: normalized.name,
        baseStats: normalized.baseStats,
        modifiers: normalized.modifiers,
    };
}

const createStoredCharacter = (
    data: PlayerData | EnemyData | NpcData,
    type: CharacterType,
    system: SystemKey
): StoredCharacter => {
    const id = crypto.randomUUID();
    const processedData = {
        ...data,
        maxHp: (data as PlayerData).maxHp ?? (data as PlayerData).hp,
    };

    const domainProps = formDataToCharacterProps(
        toFormData(processedData),
        id,
        type,
        system,
        getDefaultModifiersForCreation()
    );

    return {
        id,
        type,
        system,
        baseStats: domainProps.baseStats,
        modifiers: domainProps.modifiers,
        ...processedData,
    } as StoredCharacter;
};

export const useCharacterStore = create<CharacterStore>()(
    persist(
        (set, get) => ({
            characters: [],

            addCharacter: (data, type, system) =>
                set((state) => ({
                    characters: [...state.characters, createStoredCharacter(data, type, system)],
                })),

            removeCharacter: (id) =>
                set((state) => ({
                    characters: state.characters.filter((c) => c.id !== id),
                })),

            clearCharacters: () => set({ characters: [] }),

            updateCharacter: (id, updatedData) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;

                        const merged = { ...char, ...updatedData } as StoredCharacter;
                        const props = syncBaseStatsFromForm(
                            storedCharacterToProps(merged),
                            toFormData(merged),
                            merged.system
                        );

                        return {
                            ...merged,
                            baseStats: props.baseStats,
                            name: props.name,
                        };
                    }),
                })),

            updateHp: (id, amount) =>
                set((state) => ({
                    characters: state.characters.map((char) =>
                        char.id === id
                            ? {
                                  ...char,
                                  hp: Math.max(
                                      0,
                                      Math.min((char.hp ?? 0) + amount, char.maxHp ?? 0)
                                  ),
                              }
                            : char
                    ),
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
        }),
        {
            name: "character-storage",
            merge: (persisted, current) => {
                const state = persisted as CharacterStore | undefined;
                if (!state?.characters) return current;

                return {
                    ...current,
                    characters: state.characters.map((char) =>
                        ensureDomainFields(char as StoredCharacter)
                    ),
                };
            },
        }
    )
);
