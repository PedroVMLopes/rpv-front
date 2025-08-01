import { z } from "zod";

export const dndCharacterSchema = {
  common: {
    name: z.string().min(1, "Name is required"),
    hp: z.coerce.number().optional(),
    ac: z.coerce.number().optional()
  },
  player: {
    level: z.coerce.number().optional(),
    characterClass: z.string().optional()
  },
  enemy: {
    creatureType: z.string().optional(),
    cr: z.coerce.number().optional()
  },
  npc: {
    job: z.string().optional()
  }
};
