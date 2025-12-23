import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import { characterSchemasByType } from "@/presets/dnd/characterSchema";
import { SystemKey } from "@/presets";

// Data flux
// Form (zod) creates-> PlayerData without an ID
// Generates an unique ID
// Saves everything as a Character in the array characters: Character[]

type PlayerData = z.infer<typeof characterSchemasByType.player>;
type EnemyData = z.infer<typeof characterSchemasByType.enemy>;
type NpcData = z.infer<typeof characterSchemasByType.npc>;
export type CharacterType = "player" | "enemy" | "npc";

interface CharacterBase {
    id: string;
    type: CharacterType;
    system: SystemKey;
}

type PlayerCharacter = CharacterBase & PlayerData;
type EnemyCharacter = CharacterBase & EnemyData;
type NpcCharacter = CharacterBase & NpcData;

export type Character = PlayerCharacter | EnemyCharacter | NpcCharacter;

interface CharacterStore {
    characters: Character[];
    addCharacter: (data: PlayerData | EnemyData | NpcData, type: CharacterType, system: SystemKey) => void;
    removeCharacter: (id: string) => void;
    clearCharacters: () => void;
    updateCharacter: (id: string, updatedData: Partial<PlayerData | EnemyData | NpcData>) => void;
    updateHp: (id: string, amount: number) => void;
}

const createCharacter = (
    data: PlayerData | EnemyData | NpcData, 
    type: CharacterType, 
    system: SystemKey
): Character => {
    const baseCharacter = {
        id: crypto.randomUUID(),
        type,
        system,
    };

    const processedData = {
        ...data,
        maxHp: (data as any).maxHp ?? (data as any).hp,
    };

    return {
        ...baseCharacter,
        ...processedData,
    } as Character;
};

export const useCharacterStore = create<CharacterStore>()(
    persist(
        (set) => ({
            characters: [],
            
            addCharacter: (data, type, system) =>
                set((state) => ({
                  characters: [...state.characters, createCharacter(data, type, system)],
                })),
              
            removeCharacter: (id) =>
                set((state) => ({
                  characters: state.characters.filter((c) => c.id !== id),
                })),
              
            clearCharacters: () => set({ characters: [] }),
            
            updateCharacter: (id: string, updatedData: Partial<PlayerData | EnemyData | NpcData>) =>
                set((state) => ({
                  characters: state.characters.map((char) =>
                    char.id === id 
                      ? { ...char, ...updatedData } as Character
                      : char
                  ),
                })),
                
            updateHp: (id: string, amount: number) =>
                set((state) => ({
                  characters: state.characters.map((char) =>
                    char.id === id
                      ? {
                          ...char,
                          hp: Math.max(0, Math.min((char.hp ?? 0) + amount, char.maxHp ?? 0)),
                        } as Character
                      : char
                  ),
                })),
        }),
        {
            name: "character-storage", // localStorage key
        }
    )
);