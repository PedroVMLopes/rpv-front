import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const characterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["player", "enemy", "npc"]),
  hp: z.number().optional(),
  maxHp: z.number().optional(),
  ac: z.number().optional(),
  initiative: z.number().optional(),
  // Player Fields
  class: z.string().optional(),
  level: z.number().optional(),
  creatureType: z.string().optional(),
  cr: z.number().optional(),
  notes: z.string().optional(),
});

export type CharacterFormData = z.infer<typeof characterSchema>;