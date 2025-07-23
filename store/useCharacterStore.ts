import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import { characterSchemasByType } from "@/lib/zodSchemas";

// Data flux
// Form (zod) -> PlayerData - without an ID
// Generates an unique ID
// Saves everything as a Character in the array characters: Character[]

type PlayerData = z.infer<typeof characterSchemasByType.player>;
type EnemyData = z.infer<typeof characterSchemasByType.enemy>;
type NpcData = z.infer<typeof characterSchemasByType.npc>;

type CharacterType = "player" | "enemy" | "npc";

interface CharacterBase {
  id: string;
  type: CharacterType;
}

type PlayerCharacter = CharacterBase & PlayerData;
type EnemyCharacter = CharacterBase & EnemyData;
type NpcCharacter = CharacterBase & NpcData;

export type Character = PlayerCharacter | EnemyCharacter | NpcCharacter;

interface CharacterStore {
  characters: Character[];
  addCharacter: (data: PlayerData | EnemyData | NpcData, type: CharacterType) => void;
  removeCharacter: (id: string) => void;
  clearCharacters: () => void;
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set) => ({
      characters: [],
      addCharacter: (data, type) =>
        set((state) => ({
          characters: [
            ...state.characters,
            {
              ...data,
              type,
              id: crypto.randomUUID(),
            },
          ],
        })),
      removeCharacter: (id) =>
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
        })),
      clearCharacters: () => set({ characters: [] }),
      updateCharacter: (id: string, updatedData: Partial<PlayerData | EnemyData | NpcData>) =>
        set((state) => ({
            characters: state.characters.map((char) =>
            char.id === id ? { ...char, ...updatedData } : char
            ),
        })),
    }),
    {
      name: "character-storage", // localStorage key
    }
  )
);
